const PromoCode = require("../models/promoCode");
const ApiError = require("../utils/error");
const logger = require("../utils/logger");
const stripeService = require("./stripeService");

exports.createPromoCode = async (data) => {
  try {
    if (new Date(data.promoStartDate) > new Date(data.promoEndDate)) {
      throw new ApiError("promoStartDate cannot be after promoEndDate", 400);
    }
    // If requested, create coupon and promotion code in Stripe
    let stripeCoupon = null;
    let stripePromotion = null;

    if (data.createOnStripe) {
      try {
        const couponPayload = {};
        // map discount type to stripe coupon fields
        if (data.discountType === "Percent") {
          couponPayload.percent_off = Number(data.amount);
        } else if (data.discountType === "Fixed Amount") {
          // Stripe expects amount_off in cents
          couponPayload.amount_off = Math.round(Number(data.amount) * 100);
          couponPayload.currency = data.currency || "usd";
        }

        // allow callers to override duration or name/metadata
        couponPayload.duration = data.duration || "forever";
        if (
          data.stripeCouponOptions &&
          typeof data.stripeCouponOptions === "object"
        ) {
          Object.assign(couponPayload, data.stripeCouponOptions);
        }

        stripeCoupon = await stripeService.createCoupon(couponPayload);

        const promotionPayload = {
          coupon: stripeCoupon.id,
          code: data.code,
          active: data.isActive !== false,
        };

        if (data.usageLimit) {
          promotionPayload.max_redemptions = data.usageLimit;
        }

        if (
          data.stripePromotionCodeOptions &&
          typeof data.stripePromotionCodeOptions === "object"
        ) {
          Object.assign(promotionPayload, data.stripePromotionCodeOptions);
        }

        stripePromotion = await stripeService.createPromotionCode(
          promotionPayload
        );
      } catch (stripeErr) {
        console.log("stripeErr", stripeErr);
        logger.error("Failed to create coupon/promotion on Stripe", {
          error: stripeErr.message,
        });
        throw new ApiError(
          "Failed to create coupon/promotion on Stripe",
          500,
          stripeErr.message
        );
      }
    }

    const promo = new PromoCode({
      ...data,
      stripeCouponId: stripeCoupon ? stripeCoupon.id : undefined,
      stripePromotionCodeId: stripePromotion ? stripePromotion.id : undefined,
    });
    await promo.save();
    logger.info("PromoCode created", {
      code: data.code,
      appliesTo: data.appliesTo,
    });

    // Return created promo and Stripe objects when available
    return {
      promo,
      stripeCoupon,
      stripePromotion,
    };
  } catch (error) {
    logger.error("Error creating PromoCode", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to create PromoCode", 500, error.message);
  }
};

exports.getAllPromoCodes = async (pageNumber = 1, limitNumber = 10) => {
  try {
    const skip = (pageNumber - 1) * limitNumber;
    const promos = await PromoCode.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);
    const total = await PromoCode.countDocuments();
    const totalPages = Math.ceil(total / limitNumber);

    logger.info("Fetched all PromoCodes", { pageNumber, limitNumber });
    return {
      data: promos,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: total,
        limitNumber,
      },
    };
  } catch (error) {
    logger.error("Error fetching PromoCodes", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to fetch PromoCodes", 500, error.message);
  }
};

exports.updatePromoCode = async (id, updateData) => {
  try {
    const promo = await PromoCode.findById(id);
    if (!promo) {
      logger.warn(`PromoCode not found for ID: ${id}`);
      throw new ApiError("PromoCode not found", 404);
    }

    // Check if promo code is mirrored to Stripe
    const hasStripePromotion = Boolean(promo.stripePromotionCodeId);
    const hasStripeCoupon = Boolean(promo.stripeCouponId);

    // VALIDATION: Prevent changing code string if mirrored to Stripe
    if (
      updateData.code &&
      updateData.code !== promo.code &&
      hasStripePromotion
    ) {
      throw new ApiError(
        "Cannot change promo code string once mirrored to Stripe. Please create a new promo code instead.",
        400
      );
    }

    // VALIDATION: Warn about immutable discount fields
    if (
      (updateData.amount && updateData.amount !== promo.amount) ||
      (updateData.discountType &&
        updateData.discountType !== promo.discountType)
    ) {
      if (hasStripeCoupon) {
        throw new ApiError(
          "Cannot change discount amount or type for Stripe-mirrored promo codes. Coupon values are immutable in Stripe. Please create a new promo code instead.",
          400
        );
      }
    }

    // SYNC WITH STRIPE: Update promotion code if applicable
    if (hasStripePromotion) {
      try {
        const stripeUpdates = {};

        // Sync isActive field
        if (
          updateData.isActive !== undefined &&
          updateData.isActive !== promo.isActive
        ) {
          stripeUpdates.active = updateData.isActive;
        }

        // Sync metadata if provided
        if (updateData.metadata) {
          stripeUpdates.metadata = updateData.metadata;
        }

        // Only call Stripe if there are actual changes
        if (Object.keys(stripeUpdates).length > 0) {
          await stripeService.updatePromotionCode(
            promo.stripePromotionCodeId,
            stripeUpdates
          );
          logger.info("Stripe promotion code updated", {
            stripePromotionCodeId: promo.stripePromotionCodeId,
            updates: stripeUpdates,
          });
        }
      } catch (stripeErr) {
        logger.error("Failed to update Stripe promotion code", {
          error: stripeErr.message,
          stripePromotionCodeId: promo.stripePromotionCodeId,
        });
        throw new ApiError(
          "Failed to sync with Stripe",
          500,
          stripeErr.message
        );
      }
    }

    // SYNC WITH STRIPE: Update coupon metadata if applicable
    if (hasStripeCoupon && updateData.metadata) {
      try {
        await stripeService.updateCoupon(promo.stripeCouponId, {
          metadata: updateData.metadata,
        });
        logger.info("Stripe coupon metadata updated", {
          stripeCouponId: promo.stripeCouponId,
        });
      } catch (stripeErr) {
        logger.error("Failed to update Stripe coupon", {
          error: stripeErr.message,
          stripeCouponId: promo.stripeCouponId,
        });
        // Don't fail the entire operation if only coupon metadata update fails
        logger.warn("Continuing despite coupon metadata update failure");
      }
    }

    // Update local database
    Object.assign(promo, updateData);
    await promo.save();

    logger.info("PromoCode updated", { id });
    return promo;
  } catch (error) {
    logger.error("Error updating PromoCode", {
      id,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to update PromoCode", 500, error.message);
  }
};

exports.applyPromoCode = async (promoCode, price) => {
  try {
    const promo = await PromoCode.findOne({ code: promoCode });
    if (!promo || !promo.isActive) {
      throw new ApiError("Invalid promo code.", 400);
    }
    // Date check
    const now = new Date();
    if (now < promo.promoStartDate || now > promo.promoEndDate) {
      throw new ApiError("Promo code is expired.", 400);
    }
    // Usage limit check
    if (promo.usageLimit && promo.totalUsed >= promo.usageLimit) {
      throw new ApiError("Promo code usage limit reached.", 400);
    }
    // Discount calculation
    let finalPrice = price;
    if (promo.discountType === "Fixed Amount") {
      finalPrice = price - promo.amount;
    } else if (promo.discountType === "Percent") {
      finalPrice = price - (price * promo.amount) / 100;
    }

    if (finalPrice < 0) finalPrice = 0;

    logger.info("Promo code applied", {
      code: promoCode,
      discountType: promo.discountType,
      finalPrice,
    });

    return {
      finalPrice,
      discountApplied: price - finalPrice,
    };
  } catch (error) {
    logger.error("Error applying PromoCode", {
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to apply PromoCode", 500, error.message);
  }
};

/**
 * Soft delete a promo code (set isActive=false) and deactivate in Stripe
 * @param {string} id - PromoCode ID
 */
exports.deletePromoCode = async (id) => {
  try {
    const promo = await PromoCode.findById(id);
    if (!promo) {
      logger.warn(`PromoCode not found for ID: ${id}`);
      throw new ApiError("PromoCode not found", 404);
    }

    // Set local isActive to false (soft delete)
    promo.isActive = false;

    // Deactivate in Stripe if mirrored
    if (promo.stripePromotionCodeId) {
      try {
        await stripeService.deactivatePromotionCode(
          promo.stripePromotionCodeId
        );
        logger.info("Stripe promotion code deactivated", {
          stripePromotionCodeId: promo.stripePromotionCodeId,
        });
      } catch (stripeErr) {
        logger.error("Failed to deactivate Stripe promotion code", {
          error: stripeErr.message,
          stripePromotionCodeId: promo.stripePromotionCodeId,
        });
        throw new ApiError(
          "Failed to deactivate promotion code in Stripe",
          500,
          stripeErr.message
        );
      }
    }

    await promo.save();
    logger.info("PromoCode soft deleted", { id, code: promo.code });
    return promo;
  } catch (error) {
    logger.error("Error deleting PromoCode", {
      id,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to delete PromoCode", 500, error.message);
  }
};

/**
 * Increment promo code usage count (called by webhooks on payment completion)
 * @param {string} promoCodeId - PromoCode ID or code string
 */
exports.incrementPromoUsage = async (promoCodeId) => {
  try {
    let promo;

    // Support both ObjectId and code string lookup
    if (promoCodeId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid MongoDB ObjectId
      promo = await PromoCode.findById(promoCodeId);
    } else {
      // Assume it's a code string
      promo = await PromoCode.findOne({ code: promoCodeId });
    }

    if (!promo) {
      logger.warn(`PromoCode not found for incrementing usage: ${promoCodeId}`);
      throw new ApiError("PromoCode not found", 404);
    }

    // Increment totalUsed
    promo.totalUsed = (promo.totalUsed || 0) + 1;
    await promo.save();

    logger.info("PromoCode usage incremented", {
      id: promo._id,
      code: promo.code,
      totalUsed: promo.totalUsed,
    });

    return promo;
  } catch (error) {
    logger.error("Error incrementing PromoCode usage", {
      promoCodeId,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Failed to increment PromoCode usage",
      500,
      error.message
    );
  }
};

const PromoCode = require("../models/promoCode");
const ApiError = require("../utils/error");
const logger = require("../utils/logger");

exports.createPromoCode = async (data) => {
  try {
    if (new Date(data.promoStartDate) > new Date(data.promoEndDate)) {
      throw new ApiError("promoStartDate cannot be after promoEndDate", 400);
    }
    const promo = new PromoCode(data);
    await promo.save();
    logger.info("PromoCode created", {
      code: data.code,
      appliesTo: data.appliesTo,
    });

    return promo;
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

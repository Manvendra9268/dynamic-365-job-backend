const mongoose = require("mongoose");

const monthMap = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function buildTransactionPipeline(
  search,
  month,
  fromDate,
  toDate,
  userId = null
) {
  const pipeline = [];

  // FILTER for user only (if userId provided)
  if (userId) {
    pipeline.push({ $match: { userId: new mongoose.Types.ObjectId(userId) } });
  }

  // Lookup user
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" }
  );
  //Lookup userSubscription
  pipeline.push(
    {
      $lookup: {
        from: "usersubscriptions",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
            },
          },
          {
            $match: { status: "active" },
          },
        ],
        as: "activeSubscription",
      },
    },
    {
      $unwind: {
        path: "$activeSubscription",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  // Lookup subscription
  pipeline.push(
    {
      $lookup: {
        from: "subscriptions",
        localField: "planId",
        foreignField: "_id",
        as: "subscription",
      },
    },
    { $unwind: "$subscription" }
  );

  // Lookup promo code
  pipeline.push(
    {
      $lookup: {
        from: "promocodes",
        localField: "promoCodeId",
        foreignField: "_id",
        as: "promo",
      },
    },
    { $unwind: { path: "$promo", preserveNullAndEmptyArrays: true } }
  );

  // SEARCH FILTER
  if (search?.trim()) {
    const keyword = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "user.fullName": keyword },
          { "user.organizationName": keyword },
          { promoCode: keyword },
          { checkoutSessionId: keyword },
        ],
      },
    });
  }

  // MONTH FILTER
  if (month && month.toLowerCase() !== "all") {
    const m = monthMap[month];
    const year = new Date().getFullYear();

    if (m !== undefined) {
      pipeline.push({
        $match: {
          createdAt: {
            $gte: new Date(year, m, 1),
            $lte: new Date(year, m + 1, 0, 23, 59, 59),
          },
        },
      });
    }
  }

  // DATE RANGE FILTER
  if (fromDate || toDate) {
    const range = {};
    if (fromDate) range.$gte = new Date(fromDate);
    if (toDate) range.$lte = new Date(toDate);

    pipeline.push({ $match: { createdAt: range } });
  }

  // SORT
  pipeline.push({ $sort: { createdAt: -1 } });

  return pipeline;
}

module.exports = buildTransactionPipeline;

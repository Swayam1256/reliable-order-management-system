
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { redisClient } = require("../config/redis");

const CACHE_KEY = "orders";
const CACHE_TTL = 60;

const ALLOWED_FIELDS = [
  "customerName",
  "productName",
  "quantity",
  "price",
  "status",
];

// Check whether MongoDB is unavailable
const isDatabaseError = (error) => {
  const databaseErrorNames = [
    "MongoNetworkError",
    "MongoServerSelectionError",
    "MongooseServerSelectionError",
    "MongoNotConnectedError",
  ];

  return (
    mongoose.connection.readyState !== 1 ||
    databaseErrorNames.includes(error.name)
  );
};

// Return appropriate error responses
const handleError = (res, error) => {
  console.error("Order API error:", error.message);

  if (isDatabaseError(error)) {
    return res.status(503).json({
      success: false,
      message: "Database service is currently unavailable",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate record",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// Safely invalidate Redis cache
const invalidateOrdersCache = async () => {
  try {
    if (redisClient.isReady) {
      await redisClient.del(CACHE_KEY);
    }
  } catch (error) {
    console.error("Cache invalidation failed:", error.message);
  }
};

// Extract only permitted order fields
const getAllowedFields = (body) => {
  const filteredData = {};

  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      filteredData[field] = body[field];
    }
  }

  return filteredData;
};

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const orderData = getAllowedFields(req.body);

    const order = await Order.create(orderData);

    await invalidateOrdersCache();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET ALL ORDERS WITH REDIS CACHE
const getOrders = async (req, res) => {
  try {
    // Check Redis cache first
    if (redisClient.isReady) {
      try {
        const cachedOrders = await redisClient.get(CACHE_KEY);

        if (cachedOrders) {
          try {
            const orders = JSON.parse(cachedOrders);

            if (Array.isArray(orders)) {
              return res.status(200).json({
                success: true,
                count: orders.length,
                orders,
                source: "Redis Cache",
              });
            }
          } catch (parseError) {
            console.error(
              "Invalid cached data:",
              parseError.message
            );
          }
        }
      } catch (cacheError) {
        console.error("Redis read failed:", cacheError.message);
      }
    }

    // Fetch from MongoDB if cache misses or fails
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    // Save results in Redis
    if (redisClient.isReady) {
      try {
        await redisClient.setEx(
          CACHE_KEY,
          CACHE_TTL,
          JSON.stringify(orders)
        );
      } catch (cacheError) {
        console.error("Redis write failed:", cacheError.message);
      }
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      source: "MongoDB",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// UPDATE ORDER
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const updateData = getAllowedFields(req.body);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid order fields provided",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await invalidateOrdersCache();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE ORDER
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await invalidateOrdersCache();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};

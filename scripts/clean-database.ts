// @description Removes unreferenced or orphaned documents from the database to maintain data integrity

import { Request, Response } from "express";

import {
  Notification,
  Report,
  Review,
  Cart,
  Coupon,
  Favourite,
  Market,
  Message,
  Order,
  Property,
  Vehicle,
  Store,
} from "../src/models";
import { User } from "../src/modules/user/model";
import { catchAsync } from "../src/utils";

export const CleanupData = catchAsync(async (req: Request, res: Response) => {
  try {
    await cleanupDatabase();
    return res.status(200).json({ message: "Cleanup completed successfully!" });
  } catch (error: Error | any) {
    return res.status(500).json({ message: error.message || "Error during cleanup", error });
  }
});

// Extract the cleanup logic to a standalone function
export async function cleanupDatabase(): Promise<void> {
  // 1. Get all valid user and store IDs
  const existingUserIds = await User.find({}, "_id").lean();
  const existingStoreIds = await Store.find({}, "_id").lean();
  const validUserIds = new Set(existingUserIds.map((user) => user._id.toString()));
  const validStoreIds = new Set(existingStoreIds.map((store) => store._id.toString()));

  // 2. Remove Stores without fullName
  const storesDeleted = await Store.deleteMany({
    $or: [{ fullName: { $exists: false } }, { fullName: "" }, { fullName: null }],
  });

  // 3. Remove Vehicles with invalid owners
  const vehicles = await Vehicle.find().lean();
  const invalidVehicleIds = vehicles
    .filter((v) => !validUserIds.has(v.owner?.toString()))
    .map((v) => v._id);
  const vehiclesDeleted = await Vehicle.deleteMany({ _id: { $in: invalidVehicleIds } });

  // 4. Remove Properties with invalid owners
  const properties = await Property.find().lean();
  const invalidPropertyIds = properties
    .filter((p) => !validUserIds.has(p.owner?.toString()))
    .map((p) => p._id);
  const propertiesDeleted = await Property.deleteMany({ _id: { $in: invalidPropertyIds } });

  // 5. Remove Markets with invalid owners (can be User or Store)
  const markets = await Market.find().lean();
  const invalidMarketIds = markets
    .filter((m) => {
      if (m.type === "User" && !validUserIds.has(m.owner?.toString())) return true;
      if (m.type === "Store" && !validStoreIds.has(m.owner?.toString())) return true;
      return false;
    })
    .map((m) => m._id);
  const marketsDeleted = await Market.deleteMany({ _id: { $in: invalidMarketIds } });

  // 6. Remove Coupons with invalid owners (User)
  const coupons = await Coupon.find().lean();
  const invalidCouponIds = coupons
    .filter((c) => !validUserIds.has(c.owner?.toString()))
    .map((c) => c._id);
  const couponsDeleted = await Coupon.deleteMany({ _id: { $in: invalidCouponIds } });

  // 7. Remove Favourites with invalid user, owner, or item
  const validMarketIds = new Set(
    (await Market.find({}, "_id").lean()).map((m) => m._id.toString()),
  );
  const validVehicleIds = new Set(
    (await Vehicle.find({}, "_id").lean()).map((v) => v._id.toString()),
  );
  const validPropertyIds = new Set(
    (await Property.find({}, "_id").lean()).map((p) => p._id.toString()),
  );
  const validCouponIds = new Set(
    (await Coupon.find({}, "_id").lean()).map((c) => c._id.toString()),
  );
  const favourites = await Favourite.find().lean();
  const invalidFavouriteIds = favourites
    .filter((fav) => {
      if (!validUserIds.has(fav.user?.toString()) || !validUserIds.has(fav.owner?.toString()))
        return true;
      if (fav.type === "Market" && !validMarketIds.has(fav.item?.toString())) return true;
      if (fav.type === "Vehicle" && !validVehicleIds.has(fav.item?.toString())) return true;
      if (fav.type === "Property" && !validPropertyIds.has(fav.item?.toString())) return true;
      if (fav.type === "Coupon" && !validCouponIds.has(fav.item?.toString())) return true;
      return false;
    })
    .map((fav) => fav._id);
  const favouritesDeleted = await Favourite.deleteMany({ _id: { $in: invalidFavouriteIds } });

  // 8. Remove Orders with invalid user, store, or product
  const orders = await Order.find().lean();
  const invalidOrderIds = orders
    .filter(
      (order) =>
        !validUserIds.has(order.user?.toString()) ||
        !validStoreIds.has(order.store?.toString()) ||
        !validMarketIds.has(order.product?.toString()),
    )
    .map((order) => order._id);
  const ordersDeleted = await Order.deleteMany({ _id: { $in: invalidOrderIds } });

  // 9. Remove Carts with invalid user, store, or product
  const carts = await Cart.find().lean();
  const invalidCartIds = carts
    .filter(
      (cart) =>
        !validUserIds.has(cart.user?.toString()) ||
        !validStoreIds.has(cart.store?.toString()) ||
        !validMarketIds.has(cart.product?.toString()),
    )
    .map((cart) => cart._id);
  const cartsDeleted = await Cart.deleteMany({ _id: { $in: invalidCartIds } });

  // 10. Remove Reviews with invalid reviewer
  const reviews = await Review.find().lean();
  const invalidReviewIds = reviews
    .filter((review) => !validUserIds.has(review.reviewer?.toString()))
    .map((review) => review._id);
  const reviewsDeleted = await Review.deleteMany({ _id: { $in: invalidReviewIds } });

  // 11. Remove Notifications with invalid sender or owner
  const notifications = await Notification.find().lean();
  const invalidNotificationIds = notifications
    .filter(
      (notif) =>
        !validUserIds.has(notif.sender?.toString()) || !validUserIds.has(notif.owner?.toString()),
    )
    .map((notif) => notif._id);
  const notificationsDeleted = await Notification.deleteMany({
    _id: { $in: invalidNotificationIds },
  });

  // 12. Remove Reports with invalid reporter or reportedItem
  const validReportMarketIds = validMarketIds;
  const validReportVehicleIds = validVehicleIds;
  const validReportPropertyIds = validPropertyIds;
  const validReportUserIds = validUserIds;
  const reports = await Report.find().lean();
  const invalidReportIds = reports
    .filter((report) => {
      if (!validUserIds.has(report.reporter?.toString())) return true;
      if (report.type === "User" && !validReportUserIds.has(report.reportedItem?.toString()))
        return true;
      if (report.type === "Market" && !validReportMarketIds.has(report.reportedItem?.toString()))
        return true;
      if (report.type === "Vehicle" && !validReportVehicleIds.has(report.reportedItem?.toString()))
        return true;
      if (
        report.type === "Property" &&
        !validReportPropertyIds.has(report.reportedItem?.toString())
      )
        return true;
      return false;
    })
    .map((report) => report._id);
  const reportsDeleted = await Report.deleteMany({ _id: { $in: invalidReportIds } });

  // 13. Remove Messages with invalid sender or room
  const messages = await Message.find().lean();
  // If you have a Chat model, you can validate room as well
  const invalidMessageIds = messages
    .filter((msg) => !validUserIds.has(msg.sender?.toString()))
    .map((msg) => msg._id);
  const messagesDeleted = await Message.deleteMany({ _id: { $in: invalidMessageIds } });

  // 14. Update all users' gender to have first character uppercase
  const usersUpdated = await User.updateMany({ gender: { $type: "string", $ne: null } }, [
    {
      $set: {
        gender: {
          $concat: [
            { $toUpper: { $substrCP: ["$gender", 0, 1] } },
            { $substrCP: ["$gender", 1, { $strLenCP: "$gender" }] },
          ],
        },
      },
    },
  ]);

  console.log("✅ Database cleanup completed");
  console.log("Summary:");
  console.log("Stores deleted:", storesDeleted.deletedCount || 0);
  console.log("Vehicles deleted:", vehiclesDeleted.deletedCount || 0);
  console.log("Properties deleted:", propertiesDeleted.deletedCount || 0);
  console.log("Markets deleted:", marketsDeleted.deletedCount || 0);
  console.log("Coupons deleted:", couponsDeleted.deletedCount || 0);
  console.log("Favourites deleted:", favouritesDeleted.deletedCount || 0);
  console.log("Orders deleted:", ordersDeleted.deletedCount || 0);
  console.log("Carts deleted:", cartsDeleted.deletedCount || 0);
  console.log("Reviews deleted:", reviewsDeleted.deletedCount || 0);
  console.log("Notifications deleted:", notificationsDeleted.deletedCount || 0);
  console.log("Reports deleted:", reportsDeleted.deletedCount || 0);
  console.log("Messages deleted:", messagesDeleted.deletedCount || 0);
  console.log("Users gender updated:", usersUpdated.modifiedCount || 0);
}

// CLI entry point
if (require.main === module) {
  import("dotenv").then((dotenv) => {
    dotenv.config();
    import("mongoose").then(async (mongoose) => {
      const DB_URI = process.env.DB_URI;
      if (!DB_URI) {
        console.error("❌ DB_URI is not set");
        process.exit(1);
      }
      await mongoose.connect(DB_URI);
      console.log("✅ Connected to DB");
      try {
        await cleanupDatabase();
      } catch (err) {
        console.error("❌ Error during cleanup:", err);
        process.exit(1);
      } finally {
        await mongoose.disconnect();
        process.exit(0);
      }
    });
  });
}

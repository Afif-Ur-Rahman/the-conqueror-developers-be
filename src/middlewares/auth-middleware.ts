import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "@/constants/env";
import { statusCodes } from "@/constants/statusCodes";
import { IUser, User } from "@/modules/user/model";

interface JwtPayload {
  id: string;
  accountType?: "accountant" | "admin" | "superAdmin";
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("Access denied. No token provided.");
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

    const user = await User.findOne({ _id: decoded.id, isDeleted: { $ne: true } }).select(
      "-password",
    );

    if (!user) {
      throw new Error("Access denied. Invalid token.");
    }

    req.user = user as IUser;
    next();
  } catch (error: any) {
    res.status(statusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message || "Invalid token.",
    });
  }
};

import { Request, Response } from "express";

import { statusCodes } from "@/constants/statusCodes";
import { comparePasswords, hashPassword } from "@/modules/auth/utils";

import { IUser, User } from "../model";

export const changeProfilePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = req.user as IUser;

    const userWithPassword = await User.findOne({ _id: user._id, isDeleted: false }).select(
      "+password",
    );

    if (!userWithPassword?.password) {
      return res.status(statusCodes.NOT_FOUND).json({ message: "Account not found" });
    }

    const isMatch = await comparePasswords(oldPassword, userWithPassword.password);
    if (!isMatch) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: "Incorrect old password" });
    }

    userWithPassword.password = await hashPassword(newPassword);
    await userWithPassword.save();

    return res
      .status(statusCodes.OK)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error: Error | any) {
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message || "Server error", error });
  }
};

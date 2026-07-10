import { Request, Response } from "express";

import { sendEmail } from "@/config";
import { SERVER_URL } from "@/constants/env";
import { statusCodes } from "@/constants/statusCodes";
import { IUser, User } from "@/modules/user/model";
import { otpService } from "@/services";
import { otpEmailTemplate } from "@/templates";
import { catchAsync } from "@/utils/catch-async";

import { hashPassword } from "../utils";

export const forgotPasswordOtp = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    if (!email) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: "Email is required" });
    }

    try {
      const user = (await User.findOne(email)) as IUser;
      if (!user) {
        return res.status(statusCodes.NOT_FOUND).json({ message: "User not found" });
      }

      const { otp, otpExpires } = otpService.generateOtp();
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      const mailInfo = {
        to: email,
        subject: "Password Reset OTP",
        html: otpEmailTemplate({
          otp,
          recipientName: email.split("@")[0],
          headline: "Use this code to reset your password",
          subheading:
            "Enter the OTP below to prove it's really you before creating a new password.",
          copyUrl: `${SERVER_URL}/auth/password-reset?email=${encodeURIComponent(email)}&otp=${otp}`,
        }),
      };
      await sendEmail(mailInfo);

      return res.status(statusCodes.OK).json({ message: "OTP sent to your email" });
    } catch (error: Error | any) {
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message || "Error sending OTP", error });
    }
  },
);

export const validateOtp = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(statusCodes.BAD_REQUEST).json({ message: "Email and OTP are required" });
  }

  try {
    const user = (await User.findOne(email)) as IUser;
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: "Invalid or expired OTP" });
    }

    return res.status(statusCodes.OK).json({ message: "OTP is valid" });
  } catch (error: Error | any) {
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message || "Internal server error", error });
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const user = (await User.findOne(email)) as IUser;
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      return res.status(statusCodes.NOT_FOUND).json({ message: "Invalid or expired OTP" });
    }

    user.password = await hashPassword(newPassword);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(statusCodes.OK).json({ message: "Password reset successfully" });
  } catch (error: Error | any) {
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message || "Error resetting password", error });
  }
});

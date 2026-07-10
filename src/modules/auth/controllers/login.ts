import { Request, Response } from "express";

import { statusCodes } from "@/constants";
import { User } from "@/modules/user/model";
import { catchAsync } from "@/utils/catch-async";

import { comparePasswords, generateToken } from "../utils";

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const login = catchAsync(
  async (req: Request<object, object, LoginRequest>, res: Response): Promise<Response> => {
    try {
      const { email, password, rememberMe } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(statusCodes.NOT_FOUND).json({ message: "Invalid credentials" });
      }

      const isMatch = await comparePasswords(password, user.password);

      if (!isMatch) {
        return res.status(statusCodes.NOT_FOUND).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user, rememberMe || false);
      const accountObj = user.toObject();
      delete (accountObj as any).password;
      delete (accountObj as any).tempPassword;
      delete (accountObj as any).__v;

      return res.status(statusCodes.OK).json({
        message: "Login successful. Welcome to the App. 😀🎊 !",
        data: { ...accountObj, token },
      });
    } catch (error: Error | any) {
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message || "Error logging in", error });
    }
  },
);

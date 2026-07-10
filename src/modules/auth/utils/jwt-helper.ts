import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { JWT_SECRET } from "@/constants";

export type AccountType = "restaurant" | "employee" | "user";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  accountType: AccountType;
}

const EMPLOYEE_ROLES = new Set(["waiter", "chef", "accountant"]);

export const generateToken = (
  account: { _id: any; email: string; type?: string },
  rememberMe: boolean = false,
): string => {
  let accountType: AccountType;
  if (account.type === "restaurant" || account.type === "temp") {
    accountType = "restaurant";
  } else if (account.type && EMPLOYEE_ROLES.has(account.type)) {
    accountType = "employee";
  } else {
    accountType = "user";
  }

  const payload: JwtPayload = {
    id: (account._id as mongoose.Types.ObjectId).toString(),
    email: account.email,
    role: account.type || "normal",
    accountType,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? "7d" : "1d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

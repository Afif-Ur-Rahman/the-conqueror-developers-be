import bcrypt from "bcrypt";

import { statusCodes } from "@/constants";
import { IUser, User } from "@/modules/user/model";

interface CreateEmployeeInput {
  username: string;
  email: string;
  password: string;
  type: IUser["type"];
}

export const createEmployeeService = async (data: CreateEmployeeInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw { statusCode: statusCodes.CONFLICT, message: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const employee = await User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    type: data.type,
  });

  return employee;
};

export const getAllEmployeesService = async () => {
  const employees = await User.find({
    isDeleted: false,
    type: { $in: ["accountant", "admin"] },
  }).sort({ createdAt: -1 });

  return employees;
};

export const softDeleteEmployeeService = async (id: string) => {
  const employee = await User.findOne({ _id: id, isDeleted: false });

  if (!employee) {
    throw { statusCode: 404, message: "Employee not found" };
  }

  employee.isDeleted = true;
  employee.deletedAt = new Date();
  await employee.save();

  return employee;
};

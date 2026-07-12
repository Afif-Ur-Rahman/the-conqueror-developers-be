import { Request, Response } from "express";

import { statusCodes } from "@/constants";

import {
  createEmployeeService,
  getAllEmployeesService,
  softDeleteEmployeeService,
} from "../service";

const allowedTypes = ["accountant", "admin", "superAdmin"];

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { username, email, password, type } = req.body;

    if (!username || !email || !password || !type) {
      return res.status(statusCodes.BAD_REQUEST).json({
        success: false,
        message: "username, email, password, and type are required",
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(statusCodes.BAD_REQUEST).json({
        success: false,
        message: `type must be one of: ${allowedTypes.join(", ")}`,
      });
    }

    const employee = await createEmployeeService({ username, email, password, type });

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || statusCodes.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to create employee",
      error: err.message,
    });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await getAllEmployeesService();

    return res.status(statusCodes.OK).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || statusCodes.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to fetch employees",
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(statusCodes.BAD_REQUEST).json({
        success: false,
        message: "Employee id is required",
      });
    }

    const employee = await softDeleteEmployeeService(id as string);

    return res.status(statusCodes.OK).json({
      success: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || statusCodes.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to delete employee",
    });
  }
};

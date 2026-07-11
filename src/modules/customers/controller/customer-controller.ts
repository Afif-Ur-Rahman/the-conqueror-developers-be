import { Request, Response } from "express";

import { Customer } from "../model";

export const generateRegistrationNumber = (): number => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return randomNumber;
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { cnic, name, fatherName, address, phone, email, unitInformation } = req.body;

    const customer = await Customer.create({
      registrationNumber: generateRegistrationNumber(),
      cnic,
      name,
      fatherName,
      address,
      phone,
      email,
      unitInformation,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Customer with this CNIC or registration number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerData = req.body;
    delete customerData.registrationNumber;

    const customer = await Customer.findByIdAndUpdate(id, customerData, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Customer with this CNIC or registration number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

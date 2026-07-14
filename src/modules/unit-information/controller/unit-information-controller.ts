import { Request, Response } from "express";

import { Customer } from "@/modules/customers/model";

import { UnitInformation } from "../model";

export const createUnitInformation = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const unitData = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const unit = await UnitInformation.create({
      ...unitData,
      customer: customer._id,
    });

    customer.unitInformation.push(unit._id);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Unit added successfully",
      data: unit,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This block/unit already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

export const getUnitInformationByCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const units = await UnitInformation.find({ customer: customerId });

    return res.status(200).json({
      success: true,
      data: { customer, units },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

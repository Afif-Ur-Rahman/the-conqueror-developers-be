import { Request, Response } from "express";
import mongoose from "mongoose";

import { statusCodes } from "@/constants";
import { UnitInformation } from "@/modules/unit-information/model";

import { Payment } from "../model";
import { buildInstallmentPayments, InstallmentsPayload } from "../utils";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const unit = await UnitInformation.findById(id);

    if (!unit) {
      return res.status(statusCodes.NOT_FOUND).json({
        success: false,
        message: "Unit not found",
      });
    }

    if (req.body.type === "Custom") {
      const payment = await Payment.create({
        customer: unit.customer,
        unitInformation: unit._id,
        purpose: req.body.purpose,
        dueAmount: req.body.dueAmount,
        remainingAmount: req.body.dueAmount,
        dueDate: req.body.dueDate,
      });

      return res.status(statusCodes.CREATED).json({
        success: true,
        message: "Payment added successfully",
        data: [payment],
      });
    }

    const paymentsToCreate = buildInstallmentPayments(
      unit.customer as mongoose.Types.ObjectId,
      unit._id as mongoose.Types.ObjectId,
      req.body as InstallmentsPayload,
    );

    const payments = await Payment.insertMany(paymentsToCreate);

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: "Installments created successfully",
      data: payments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

export const getPaymentsByUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payments = await Payment.find({ unitInformation: id }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

export const getPaymentsByCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    const payments = await Payment.find({ customer: customerId })
      .populate("unitInformation")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

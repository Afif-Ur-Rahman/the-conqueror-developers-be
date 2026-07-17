import { Request, Response } from "express";
import mongoose from "mongoose";

import { statusCodes } from "@/constants";
import { Payment } from "@/modules/payment/model";
import { UnitInformation } from "@/modules/unit-information/model";

import { Receipt } from "../model";
import { recalculatePaymentTotals } from "../utils";

export const createReceipt = async (req: Request, res: Response) => {
  const user = req.user;
  const { paymentId } = req.params;
  const { receivedAmount, paymentMethod, paidDate } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(statusCodes.NOT_FOUND).json({ success: false, message: "Payment not found" });
  }

  const receipt = await Receipt.create({
    createdBy: user?._id,
    payment: payment._id,
    customer: payment.customer,
    unitInformation: payment.unitInformation,
    receivedAmount,
    paymentMethod,
    paidDate,
  });

  const updatedPayment = await recalculatePaymentTotals(payment._id as mongoose.Types.ObjectId);
  const updatedUnit = await UnitInformation.findById(payment.unitInformation);

  return res.status(statusCodes.CREATED).json({
    success: true,
    message: "Receipt Recorded",
    data: { receipt, payment: updatedPayment, unit: updatedUnit },
  });
};

export const updateReceipt = async (req: Request, res: Response) => {
  const { receiptId } = req.params;
  const { receivedAmount, paymentMethod, paidDate } = req.body;

  const receipt = await Receipt.findByIdAndUpdate(
    receiptId,
    { receivedAmount, paymentMethod, paidDate },
    { new: true, runValidators: true },
  );
  if (!receipt) {
    return res.status(statusCodes.NOT_FOUND).json({ success: false, message: "Receipt not found" });
  }

  const updatedPayment = await recalculatePaymentTotals(receipt.payment);

  return res.status(statusCodes.OK).json({
    success: true,
    messages: "Receipt Updated",
    data: { receipt, payment: updatedPayment },
  });
};

export const deleteReceipt = async (req: Request, res: Response) => {
  const { receiptId } = req.params;

  const receipt = await Receipt.findByIdAndDelete(receiptId);
  if (!receipt) {
    return res.status(statusCodes.NOT_FOUND).json({ success: false, message: "Receipt not found" });
  }

  const updatedPayment = await recalculatePaymentTotals(receipt.payment);

  return res.status(statusCodes.OK).json({ success: true, payment: updatedPayment });
};

export const getReceiptsByPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const receipts = await Receipt.find({ payment: paymentId }).populate("createdBy");

  return res.status(statusCodes.OK).json({ success: true, data: receipts });
};

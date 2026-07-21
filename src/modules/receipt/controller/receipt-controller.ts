import { Request, Response } from "express";
import mongoose from "mongoose";

import { sendEmail } from "@/config";
import { statusCodes } from "@/constants";
import { Customer } from "@/modules/customers/model";
import { Payment } from "@/modules/payment/model";
import { UnitInformation } from "@/modules/unit-information/model";
import { receiptConfirmationTemplate } from "@/templates";
import { formatPrice } from "@/utils";

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

  const customer = await Customer.findById(payment.customer);
  if (customer?.email && updatedUnit) {
    sendEmail({
      to: customer.email,
      subject: "Payment Receipt - The Conqueror Developers",
      html: receiptConfirmationTemplate({
        customerName: customer.name,
        receivedAmount: formatPrice(receivedAmount),
        paymentMethod,
        paidDate: new Date(paidDate).toLocaleDateString(),
        building: updatedUnit.building,
        block: updatedUnit.block,
        unit: updatedUnit.unit,
        totalPrice: formatPrice(updatedUnit.price),
        totalReceived: formatPrice(updatedUnit.receivedAmount ?? 0),
        outstandingAmount: formatPrice(updatedUnit.outstandingAmount ?? 0),
        overDueAmount: updatedUnit.overDueAmount,
        holdAmount: updatedUnit.holdAmount,
      }),
    }).catch((err) => console.error("Failed to send receipt email:", err));
  }

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

import mongoose from "mongoose";

import { Payment } from "../payment/model";
import { recalculateUnitTotals } from "../payment/utils";

import { Receipt } from "./model";

export const recalculatePaymentTotals = async (paymentId: mongoose.Types.ObjectId | string) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  const receipts = await Receipt.find({ payment: paymentId }).sort({ paidDate: 1 });

  const receivedAmount = receipts.reduce((sum, r) => sum + r.receivedAmount, 0);
  const remainingAmount = payment.dueAmount - receivedAmount;
  const paidDate = receipts.length > 0 ? receipts[receipts.length - 1].paidDate : undefined;

  payment.receivedAmount = receivedAmount;
  payment.remainingAmount = remainingAmount;
  payment.paidDate = paidDate;

  await payment.save();

  await recalculateUnitTotals(payment.unitInformation.toString());

  return payment;
};

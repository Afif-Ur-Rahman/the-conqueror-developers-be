import { Request, Response } from "express";

import { UnitInformation } from "@/modules/unit-information/model";

import { Payment } from "../model";

const recalculateUnitTotals = async (unitId: string) => {
  const unit = await UnitInformation.findById(unitId);

  if (!unit) return;

  const payments = await Payment.find({ unitInformation: unitId });

  const receivedAmount = payments.reduce((sum, payment) => sum + (payment.receivedAmount || 0), 0);
  const outstandingAmount = unit.price - receivedAmount;

  const today = new Date();
  const overDueAmount = payments.reduce((sum, payment) => {
    const remaining = payment.dueAmount - (payment.receivedAmount || 0);
    const isOverdue = payment.dueDate < today && remaining > 0;
    return isOverdue ? sum + remaining : sum;
  }, 0);

  const received = unit.price > 0 ? Number(((receivedAmount / unit.price) * 100).toFixed(2)) : 0;

  unit.receivedAmount = receivedAmount;
  unit.outstandingAmount = outstandingAmount < 0 ? 0 : outstandingAmount;
  unit.overDueAmount = overDueAmount;
  unit.received = received;

  await unit.save();
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { customer, unitInformation, installments } = req.body;

    if (!Array.isArray(installments) || installments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Installments array is required",
      });
    }

    const unit = await UnitInformation.findById(unitInformation);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit information not found",
      });
    }

    const payments = await Payment.insertMany(
      installments.map((installment: any) => ({
        customer,
        unitInformation,
        purpose: installment.purpose,
        dueAmount: installment.dueAmount,
        remainingAmount: installment.dueAmount,
        dueDate: installment.dueDate,
      })),
    );

    return res.status(201).json({
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
    const { unitId } = req.params;

    const payments = await Payment.find({ unitInformation: unitId }).sort({ dueDate: 1 });

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

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receivedAmount, paidDate, paymentMethod } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.receivedAmount = receivedAmount;
    payment.remainingAmount = payment.dueAmount - receivedAmount;
    payment.paidDate = paidDate;
    payment.paymentMethod = paymentMethod;

    await payment.save();
    await recalculateUnitTotals(payment.unitInformation.toString());

    const updatedUnit = await UnitInformation.findById(payment.unitInformation);

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: { payment, unitInformation: updatedUnit },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

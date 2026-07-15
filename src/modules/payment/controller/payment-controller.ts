import { addMonths } from "date-fns";
import { Request, Response } from "express";
import mongoose from "mongoose";

import { statusCodes } from "@/constants";
import { UnitInformation } from "@/modules/unit-information/model";

import { IPayment, Payment } from "../model";

interface InstallmentsPayload {
  type: "Installments";
  dueAmount: number;
  dueDate: string;
  installments: number;
  balloon: number;
  totalBalloons: number;
}

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

const buildInstallmentPayments = (
  customer: mongoose.Types.ObjectId,
  unitInformation: mongoose.Types.ObjectId,
  payload: InstallmentsPayload,
) => {
  const payments: Partial<IPayment>[] = [];

  const balloonInterval = payload.installments / payload.totalBalloons;

  const balloonPositions = new Set(
    Array.from({ length: payload.totalBalloons }, (_, i) => Math.round((i + 1) * balloonInterval)),
  );

  let currentDate = new Date(payload.dueDate);
  let balloonCount = 0;

  for (let installmentCount = 1; installmentCount <= payload.installments; installmentCount++) {
    payments.push({
      customer,
      unitInformation,
      purpose: `Installment #${installmentCount}`,
      dueAmount: payload.dueAmount,
      remainingAmount: payload.dueAmount,
      dueDate: currentDate,
    });

    currentDate = addMonths(currentDate, 1);

    if (balloonPositions.has(installmentCount)) {
      balloonCount += 1;

      payments.push({
        customer,
        unitInformation,
        purpose: `Balloon Payment #${balloonCount}`,
        dueAmount: payload.balloon,
        remainingAmount: payload.balloon,
        dueDate: currentDate,
      });

      currentDate = addMonths(currentDate, 1);
    }
  }

  return payments;
};

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

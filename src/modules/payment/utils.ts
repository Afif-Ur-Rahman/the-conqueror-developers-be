import { addMonths } from "date-fns";
import mongoose from "mongoose";

import { UnitInformation } from "../unit-information/model";

import { IPayment, Payment } from "./model";

export interface InstallmentsPayload {
  type: "Installments";
  dueAmount: number;
  dueDate: string;
  installments: number;
  balloon: number;
  totalBalloons: number;
}

export const recalculateUnitTotals = async (unitId: string) => {
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

export const buildInstallmentPayments = (
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

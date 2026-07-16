import mongoose, { Document, Model } from "mongoose";

export interface IPayment extends Document {
  customer: mongoose.Types.ObjectId;
  unitInformation: mongoose.Types.ObjectId;
  purpose: string;
  dueAmount: number;
  receivedAmount: number;
  remainingAmount: number;
  dueDate: Date;
  paidDate?: Date;
}

type PaymentModel = Model<IPayment, object>;

const paymentSchema = new mongoose.Schema<IPayment, PaymentModel>(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    unitInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitInformation",
      required: true,
    },
    purpose: { type: String, required: true },
    dueAmount: { type: Number, required: true },
    receivedAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date, default: undefined },
  },
  { timestamps: true },
);

paymentSchema.index({ customer: 1 });
paymentSchema.index({ unitInformation: 1 });
paymentSchema.index({ dueDate: 1 });

export const Payment = mongoose.model<IPayment, PaymentModel>("Payment", paymentSchema);

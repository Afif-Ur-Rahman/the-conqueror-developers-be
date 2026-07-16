import mongoose, { Document, Model } from "mongoose";

export const PAYMENT_METHODS = ["Cash", "Online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IReceipt extends Document {
  payment: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  unitInformation: mongoose.Types.ObjectId;
  receivedAmount: number;
  paymentMethod: PaymentMethod;
  paidDate: Date;
}

type ReceiptModel = Model<IReceipt, object>;

const receiptSchema = new mongoose.Schema<IReceipt, ReceiptModel>(
  {
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    unitInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitInformation",
      required: true,
    },
    receivedAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paidDate: { type: Date, required: true },
  },
  { timestamps: true },
);

receiptSchema.index({ payment: 1 });
receiptSchema.index({ customer: 1 });
receiptSchema.index({ unitInformation: 1 });

export const Receipt = mongoose.model<IReceipt, ReceiptModel>("Receipt", receiptSchema);

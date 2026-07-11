import mongoose, { Document, Model } from "mongoose";

export type UnitInformation = {
  block: string;
  unit: string;
  type: string;
  category: string;
  size: string;
  bookingDate: Date;
  price: number;
  receivedAmount?: number;
  outstandingAmount?: number;
  holdAmount?: number;
  overDueAmount?: number;
  received: number;
};

export interface ICustomer extends Document {
  registrationNumber: string;
  cnic: string;
  name: string;
  fatherName: string;
  address: string;
  phone: string;
  email: string;
  unitInformation: UnitInformation[];
}

type CustomerModel = Model<ICustomer, object>;

const customerSchema = new mongoose.Schema<ICustomer, CustomerModel>(
  {
    registrationNumber: { type: String, required: true },
    cnic: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    unitInformation: [
      {
        block: { type: String, required: true },
        unit: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        size: { type: String, required: true },
        bookingDate: { type: Date, required: true },
        price: { type: Number, required: true },
        receivedAmount: { type: Number, default: 0 },
        outstandingAmount: { type: Number, default: 0 },
        holdAmount: { type: Number, default: 0 },
        overDueAmount: { type: Number, default: 0 },
        received: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  },
);

customerSchema.index({ cnic: 1 }, { unique: true });
customerSchema.index({ registrationNumber: 1 }, { unique: true });

export const Customer = mongoose.model<ICustomer, CustomerModel>("Customer", customerSchema);

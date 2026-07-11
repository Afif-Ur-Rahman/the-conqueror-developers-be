import mongoose, { Document, Model } from "mongoose";

export interface ICustomer extends Document {
  registrationNumber: string;
  cnic: string;
  name: string;
  fatherName: string;
  address: string;
  phone: string;
  email: string;
  unitInformation: mongoose.Types.ObjectId[];
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
      { type: mongoose.Schema.Types.ObjectId, ref: "UnitInformation", default: [] },
    ],
  },
  {
    timestamps: true,
  },
);

customerSchema.index({ cnic: 1 }, { unique: true });
customerSchema.index({ registrationNumber: 1 }, { unique: true });

export const Customer = mongoose.model<ICustomer, CustomerModel>("Customer", customerSchema);

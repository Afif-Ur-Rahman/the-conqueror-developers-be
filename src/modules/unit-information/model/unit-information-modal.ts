import mongoose, { Document, Model } from "mongoose";

export interface IUnitInformation extends Document {
  customer: mongoose.Types.ObjectId;
  block: string;
  unit: string;
  type: string;
  category: string;
  size: string;
  bookingDate: Date;
  building: string;
  price: number;
  receivedAmount?: number;
  outstandingAmount?: number;
  holdAmount?: number;
  overDueAmount?: number;
  received: number;
}

type UnitInformationModel = Model<IUnitInformation, object>;

const unitInformationSchema = new mongoose.Schema<IUnitInformation, UnitInformationModel>(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
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
    building: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

unitInformationSchema.index({ customer: 1 });
unitInformationSchema.index({ block: 1, unit: 1 });
unitInformationSchema.index({ building: 1 });
unitInformationSchema.index({ building: 1, block: 1, unit: 1 }, { unique: true });

export const UnitInformation = mongoose.model<IUnitInformation, UnitInformationModel>(
  "UnitInformation",
  unitInformationSchema,
);

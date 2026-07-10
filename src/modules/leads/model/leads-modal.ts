import mongoose, { Document, Model } from "mongoose";

export interface ILead extends Document {
  email: string;
  name: string;
  phone: string;
  message: string;
}

type LeadModel = Model<ILead, object>;

const leadSchema = new mongoose.Schema<ILead, LeadModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
  },
  {
    timestamps: true,
  },
);

export const Lead = mongoose.model<ILead, LeadModel>("Lead", leadSchema);

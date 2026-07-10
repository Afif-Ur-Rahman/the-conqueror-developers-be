import { Request, Response } from "express";

import { Lead } from "../model";

export const createLead = async (req: Request, res: Response) => {
  try {
    const { email, name, phone, message } = req.body;

    const lead = await Lead.create({ email, name, phone, message });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully. We will contact you shortly",
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have alreay submitted a message. We will contact you shortly.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

export const getLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.errors,
    });
  }
};

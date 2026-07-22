import { Request, Response } from "express";

import { sendEmail } from "@/config";
import { statusCodes } from "@/constants";
import { leadNotificationTemplate } from "@/templates";

import { Lead } from "../model";

export const getLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    return res.status(statusCodes.OK).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error: any) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.errors,
    });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const { email, name, phone, message } = req.body;

    const lead = await Lead.create({ email, name, phone, message });

    const mailInfo = {
      to: "theconqueror.office@gmail.com",
      subject: `New Lead: ${name}`,
      html: leadNotificationTemplate({
        name,
        email,
        phone,
        message,
      }),
    };

    if (lead) {
      sendEmail(mailInfo).catch((err) => console.error("Failed to send receipt email:", err));
    }

    return res.status(statusCodes.CREATED).json({
      success: true,
      message: "Message sent successfully. We will contact you shortly",
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(statusCodes.CONFLICT).json({
        success: false,
        message: "You have alreay submitted a message. We will contact you shortly.",
      });
    }

    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.errors,
    });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.isContacted = !lead.isContacted;
    await lead.save();

    return res.status(statusCodes.OK).json({
      success: true,
      message: "Status updated successfully",
      data: lead,
    });
  } catch (error: any) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.errors || error.message,
    });
  }
};

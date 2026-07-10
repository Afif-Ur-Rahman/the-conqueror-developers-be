import { Request, Response } from "express";

import { sendEmail } from "@/config";
import { leadNotificationTemplate } from "@/templates";

import { Lead } from "../model";

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

    if (lead) await sendEmail(mailInfo);

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

import { BREVO, MODE } from "@/constants/env";

const SibApiV3Sdk = require("sib-api-v3-sdk");

interface IMailInfo {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (mailInfo: IMailInfo): Promise<void> => {
  if (MODE === "dev") {
    console.log("[Brevo] Skipping email in dev mode:", mailInfo.subject, "->", mailInfo.to);
    return;
  }

  if (!BREVO.API_KEY) {
    throw new Error("Brevo API key is not configured");
  }

  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = BREVO.API_KEY;

    const api = new SibApiV3Sdk.TransactionalEmailsApi();
    const mail = new SibApiV3Sdk.SendSmtpEmail();

    mail.subject = mailInfo.subject;
    mail.sender = { email: BREVO.EMAIL, name: BREVO.NAME };
    mail.to = [{ email: mailInfo.to }];
    mail.htmlContent = mailInfo.html;

    await api.sendTransacEmail(mail);
  } catch (error: any) {
    console.log("[Brevo] Failed to send email:", error);
    throw new Error(`Failed to send email to ${mailInfo.to}: ${error.message}`);
  }
};

interface OtpEmailTemplateOptions {
  otp: string;
  recipientName?: string;
  headline?: string;
  subheading?: string;
  copyUrl?: string;
  supportEmail?: string;
  brandName?: string;
  footerNote?: string;
}

const BASE_STYLES = {
  background: "#f5f5f7",
  cardBackground: "#ffffff",
  accent: "#5035ff",
  accentDark: "#3c2acc",
  textPrimary: "#1f1f24",
  textSecondary: "#555770",
  divider: "#e0e2ec",
  success: "#19c37d",
};

const sanitize = (value?: string) => value?.replace(/[<>]/g, "") ?? "";

export const otpEmailTemplate = (options: OtpEmailTemplateOptions) => {
  const {
    otp,
    recipientName = "there",
    headline = "Welcome to The Conqueror Developers",
    subheading = "Use the code below.",
    supportEmail = "theconqueror.office@gmail.com",
    brandName = "The Conqueror Developers",
    footerNote = "If you didn’t request this, please ignore this email or contact support so we can keep your account safe.",
  } = options;

  const previewText = `Your ${brandName} verification code is ${otp}.`;
  const safeOtp = sanitize(otp);

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${brandName} verification code</title>
      <style>
        @media (max-width: 600px) {
          .card {
            padding: 24px !important;
          }
          .otp-value {
            font-size: 28px !important;
            letter-spacing: 6px !important;
          }
          .btn {
            display: block !important;
            width: 100% !important;
          }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:${BASE_STYLES.background};font-family:'Inter', 'Segoe UI', sans-serif;color:${BASE_STYLES.textPrimary};">
      <span style="display:none !important;visibility:hidden;opacity:0;height:0;width:0;mso-hide:all;">
        ${previewText}
      </span>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
        <tr>
          <td align="center">
            <table class="card" width="100%" style="max-width:520px;background:${BASE_STYLES.cardBackground};border-radius:24px;padding:40px;box-shadow:0 20px 40px rgba(37,44,97,0.15);">
              <tr>
                <td style="text-align:center;">
                  <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:${BASE_STYLES.accent};margin-bottom:12px;">
                    ${brandName} onboarding
                  </div>
                  <h1 style="font-size:28px;margin:0 0 12px 0;color:${BASE_STYLES.textPrimary};">
                    ${headline}
                  </h1>
                  <p style="margin:0;color:${BASE_STYLES.textSecondary};font-size:16px;line-height:1.6;">
                    Hey ${sanitize(recipientName)}, ${subheading}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fafbff;border:1px solid ${BASE_STYLES.divider};border-radius:20px;padding:32px;text-align:center;">
                    <tr>
                      <td style="font-size:13px;font-weight:600;letter-spacing:2px;color:${BASE_STYLES.textSecondary};text-transform:uppercase;">
                        One-time passcode
                      </td>
                    </tr>
                    <tr>
                      <td class="otp-value" style="font-size:36px;font-weight:700;letter-spacing:10px;color:${BASE_STYLES.textPrimary};padding:18px 0;">
                        ${safeOtp}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${BASE_STYLES.textSecondary};">
                        Expires in 10 minutes · Keep this code private
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="text-align:center;padding-top:16px;font-size:13px;color:${BASE_STYLES.textSecondary};">
                        Having trouble? You can also copy the code manually or reply to this email.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:32px;border-top:1px solid ${BASE_STYLES.divider};">
                  <p style="margin:0 0 12px 0;font-size:15px;color:${BASE_STYLES.textPrimary};font-weight:600;">
                    Next up for you
                  </p>
                  <ul style="padding-left:20px;margin:0;color:${BASE_STYLES.textSecondary};line-height:1.7;font-size:14px;">
                    <li>Verify your email with the code above.</li>
                    <li>Set up your restaurant profile and team roles.</li>
                    <li>Launch curated experiences for your guests.</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding-top:28px;">
                  <div style="background:#eefdf5;border-radius:16px;padding:18px 20px;color:${BASE_STYLES.success};font-size:14px;font-weight:600;">
                    Pro tip: Add ${supportEmail} to your trusted contacts so important updates never land in spam.
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding-top:28px;font-size:13px;color:${BASE_STYLES.textSecondary};line-height:1.6;">
                  ${footerNote}
                </td>
              </tr>
              <tr>
                <td style="padding-top:12px;font-size:12px;color:${BASE_STYLES.textSecondary};text-align:center;">
                  © ${new Date().getFullYear()} ${brandName}. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

export const leadNotificationTemplate = (options: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  brandName?: string;
  dashboardUrl?: string;
  supportEmail?: string;
}) => {
  const {
    name,
    email,
    phone = "Not provided",
    message = "No message provided",
    brandName = "The Conqueror Developers",
  } = options;

  const safeName = sanitize(name);
  const safeEmail = sanitize(email);
  const safePhone = sanitize(phone);
  const safeMessage = sanitize(message).replace(/\n/g, "<br>");

  const previewText = `New Lead Received: ${safeName} (${safeEmail})`;

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Lead - ${brandName}</title>
      <style>
        @media (max-width: 600px) {
          .card { padding: 24px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:${BASE_STYLES.background};font-family:'Inter', 'Segoe UI', sans-serif;color:${BASE_STYLES.textPrimary};">
      <span style="display:none !important;visibility:hidden;opacity:0;height:0;width:0;mso-hide:all;">
        ${previewText}
      </span>
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
        <tr>
          <td align="center">
            <table class="card" width="100%" style="max-width:560px;background:${BASE_STYLES.cardBackground};border-radius:24px;padding:40px;box-shadow:0 20px 40px rgba(37,44,97,0.15);">
              
              <!-- Header -->
              <tr>
                <td style="text-align:center;">
                  <h1 style="font-size:28px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:${BASE_STYLES.accent};">
                    NEW LEAD ALERT
                  </h1>
                  <p style="margin:0;color:${BASE_STYLES.textSecondary};font-size:16px;line-height:1.6;">
                    A new potential customer has reached out.
                  </p>
                </td>
              </tr>

              <!-- Lead Details -->
              <tr>
                <td style="padding:32px 0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fafbff;border:1px solid ${BASE_STYLES.divider};border-radius:20px;padding:32px;">
                    <tr>
                      <td style="padding-bottom:16px;">
                        <strong style="color:${BASE_STYLES.textPrimary};">Name:</strong> ${safeName}<br>
                        <strong style="color:${BASE_STYLES.textPrimary};">Email:</strong> <a href="mailto:${safeEmail}" style="color:${BASE_STYLES.accent};">${safeEmail}</a><br>
                        <strong style="color:${BASE_STYLES.textPrimary};">Phone:</strong> ${safePhone}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:20px;border-top:1px solid ${BASE_STYLES.divider};">
                        <strong style="color:${BASE_STYLES.textPrimary};">Message:</strong><br>
                        <p style="margin:12px 0 0 0; color:${BASE_STYLES.textSecondary}; line-height:1.6;">
                          ${safeMessage}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom:24px;">
                  <p style="margin:0 0 12px 0;font-size:15px;color:${BASE_STYLES.textPrimary};font-weight:600;">
                    Recommended Next Steps
                  </p>
                  <ul style="padding-left:20px;margin:0;color:${BASE_STYLES.textSecondary};line-height:1.7;font-size:14px;">
                    <li>Contact them within 24 hours for best conversion.</li>
                    <li>Check their details in the Leads section.</li>
                    <li>Assign to a team member if needed.</li>
                  </ul>
                </td>
              </tr>

              <tr>
                <td style="padding-top:20px;font-size:12px;color:${BASE_STYLES.textSecondary};text-align:center;">
                  © ${new Date().getFullYear()} ${brandName}. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

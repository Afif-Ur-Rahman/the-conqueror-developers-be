import { BASE_STYLES, sanitize } from "./styles";

interface ReceiptConfirmationTemplateOptions {
  customerName: string;
  receivedAmount: string | number;
  paymentMethod: string;
  paidDate: string;
  building: string;
  block: string;
  unit: string;
  totalPrice: string | number;
  totalReceived: string | number;
  outstandingAmount: string | number;
  overDueAmount?: string | number;
  holdAmount?: string | number;
  brandName?: string;
  supportEmail?: string;
}

export const receiptConfirmationTemplate = (options: ReceiptConfirmationTemplateOptions) => {
  const {
    customerName,
    receivedAmount,
    paymentMethod,
    paidDate,
    building,
    block,
    unit,
    totalPrice,
    totalReceived,
    outstandingAmount,
    overDueAmount,
    holdAmount,
    brandName = "The Conqueror Developers",
    supportEmail = "theconqueror.office@gmail.com",
  } = options;

  const safeName = sanitize(customerName);
  const unitLabel = `${sanitize(building)} - Block ${sanitize(block)}, Unit ${sanitize(unit)}`;
  const previewText = `Payment received: PKR ${receivedAmount} for ${unitLabel}`;

  const overdueRow =
    overDueAmount && Number(overDueAmount) > 0
      ? `<tr>
          <td style="padding-top:12px;">
            <strong style="color:#d64545;">Overdue Amount:</strong>
            <span style="color:#d64545;font-weight:700;">PKR ${overDueAmount}</span>
          </td>
        </tr>`
      : "";

  const holdRow =
    holdAmount && Number(holdAmount) > 0
      ? `<tr>
          <td style="padding-top:12px;">
            <strong style="color:${BASE_STYLES.textPrimary};">Hold Amount:</strong> PKR ${holdAmount}
          </td>
        </tr>`
      : "";

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Receipt - ${brandName}</title>
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
            <table class="card" width="100%" style="max-width:520px;background:${BASE_STYLES.cardBackground};border-radius:24px;padding:40px;box-shadow:0 20px 40px rgba(37,44,97,0.15);">
              <tr>
                <td style="text-align:center;">
                  <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:${BASE_STYLES.accent};margin-bottom:12px;">
                    ${brandName}
                  </div>
                  <h1 style="font-size:26px;margin:0 0 12px 0;color:${BASE_STYLES.textPrimary};">
                    Payment Received
                  </h1>
                  <p style="margin:0;color:${BASE_STYLES.textSecondary};font-size:16px;line-height:1.6;">
                    Hi ${safeName}, we've recorded your payment for <strong>${unitLabel}</strong>.
                  </p>
                </td>
              </tr>

              <!-- This transaction -->
              <tr>
                <td style="padding:32px 0 0 0;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fafbff;border:1px solid ${BASE_STYLES.divider};border-radius:20px;padding:32px;">
                    <tr>
                      <td style="padding-bottom:12px;">
                        <strong style="color:${BASE_STYLES.textPrimary};">Amount Received:</strong>
                        <span style="color:${BASE_STYLES.success};font-weight:700;">PKR ${receivedAmount}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:12px;">
                        <strong style="color:${BASE_STYLES.textPrimary};">Payment Method:</strong> ${sanitize(String(paymentMethod))}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong style="color:${BASE_STYLES.textPrimary};">Date:</strong> ${sanitize(String(paidDate))}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Unit standing -->
              <tr>
                <td style="padding:20px 0 0 0;">
                  <p style="margin:0 0 12px 0;font-size:15px;color:${BASE_STYLES.textPrimary};font-weight:600;">
                    Unit Summary
                  </p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fafbff;border:1px solid ${BASE_STYLES.divider};border-radius:20px;padding:32px;">
                    <tr>
                      <td>
                        <strong style="color:${BASE_STYLES.textPrimary};">Total Price:</strong> PKR ${totalPrice}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:12px;">
                        <strong style="color:${BASE_STYLES.textPrimary};">Total Received:</strong> PKR ${totalReceived}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:12px;">
                        <strong style="color:${BASE_STYLES.textPrimary};">Outstanding Amount:</strong> PKR ${outstandingAmount}
                      </td>
                    </tr>
                    ${overdueRow}
                    ${holdRow}
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding-top:24px;font-size:13px;color:${BASE_STYLES.textSecondary};line-height:1.6;">
                  Questions about this payment? Reply to this email or reach us at ${supportEmail}.
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

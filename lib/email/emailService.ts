import { Resend } from "resend";

let resend: Resend | undefined;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
  }

  resend ??= new Resend(apiKey);
  return resend;
}

type SendCustomerOrderEmailInput = {
  to: string;
  bcc?: string;
  subject: string;
  html: string;
  invoiceFilename: string;
  invoicePdf: Buffer;
};

export async function sendCustomerOrderEmail(input: SendCustomerOrderEmailInput) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
  }

  return getResend().emails.send({
    from,
    to: input.to,
    ...(input.bcc ? { bcc: input.bcc } : {}),
    subject: input.subject,
    html: input.html,
    attachments: [{ filename: input.invoiceFilename, content: input.invoicePdf }],
  });
}

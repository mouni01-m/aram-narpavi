import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Please provide your name, email, subject, and message." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.ADMIN_ORDER_EMAIL || "aramnarpavi@gmail.com";

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Email service is not configured." },
        { status: 202 }
      );
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.ORDER_EMAIL_FROM || "Aram Narpavi Orders <orders@resend.dev>",
      to: recipient,
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#173522">
          <h2 style="color:#1E5631">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact email error", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to send your message.",
      },
      { status: 500 }
    );
  }
}

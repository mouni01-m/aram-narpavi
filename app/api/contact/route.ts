import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "aramnarpavi@gmail.com",
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Subject:</strong> ${subject}</p>

        <p><strong>Message:</strong></p>

        <p>${message}</p>
      `,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {
  console.error("RESEND ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: error?.message || "Unknown error",
    },
    { status: 500 }
  );
}
}

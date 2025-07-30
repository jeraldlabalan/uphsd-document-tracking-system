import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({ to, otp }: { to: string; otp: string }) {
  const { data, error } = await resend.emails.send({
    from: 'Document Tracker <onboarding@resend.dev>',
    to,
    subject: 'Your OTP Verification Code',
    html: `<p>Your OTP code is:</p><h2>${otp}</h2>`,
  });

  if (error) {
    console.error('❌ Resend error:', error);
    throw error;
  }

  console.log('✅ Email sent via Resend:', data);
}
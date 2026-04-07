import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'MediBook <noreply@medibook.com>';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not defined. Email dispatch skipped for:', to);
    return { success: true, warning: 'Email not sent due to missing API key' };
  }
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendBookingConfirmation({
  patientEmail,
  patientName,
  doctorName,
  date,
  time,
  clinicName,
  fee,
}: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  clinicName: string;
  fee: string;
}) {
  return sendEmail({
    to: patientEmail,
    subject: 'Appointment Booking Confirmed — MediBook',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fffe; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${patientName}</strong>,</p>
          <p style="color: #374151;">Your appointment has been successfully booked. Here are the details:</p>
          <div style="background: white; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 8px 0;"><strong>Clinic:</strong> ${clinicName}</p>
            <p style="margin: 8px 0;"><strong>Fee Paid:</strong> ${fee}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Please arrive 10 minutes before your scheduled time.</p>
        </div>
      </div>
    `,
  });
}

export async function sendNewBookingNotification({
  doctorEmail,
  doctorName,
  patientName,
  date,
  time,
  reason,
}: {
  doctorEmail: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
}) {
  return sendEmail({
    to: doctorEmail,
    subject: 'New Appointment Booked — MediBook',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fffe; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📅 New Appointment</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi Dr. <strong>${doctorName}</strong>,</p>
          <p style="color: #374151;">A new appointment has been booked:</p>
          <div style="background: white; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Patient:</strong> ${patientName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 8px 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendDoctorApprovalEmail({
  doctorEmail,
  doctorName,
}: {
  doctorEmail: string;
  doctorName: string;
}) {
  return sendEmail({
    to: doctorEmail,
    subject: 'Your Doctor Account has been Approved — MediBook',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fffe; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to MediBook!</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi Dr. <strong>${doctorName}</strong>,</p>
          <p style="color: #374151;">Your account has been approved! You can now log in and start managing your schedule.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Log In Now</a>
        </div>
      </div>
    `,
  });
}

export async function sendDoctorRejectionEmail({
  doctorEmail,
  doctorName,
  reason,
}: {
  doctorEmail: string;
  doctorName: string;
  reason: string;
}) {
  return sendEmail({
    to: doctorEmail,
    subject: 'Doctor Registration Update — MediBook',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Registration Update</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi Dr. <strong>${doctorName}</strong>,</p>
          <p style="color: #374151;">Unfortunately, your registration has not been approved.</p>
          <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">You may re-apply with updated credentials if applicable.</p>
        </div>
      </div>
    `,
  });
}

export async function sendCancellationEmail({
  recipientEmail,
  recipientName,
  cancelledByRole,
  date,
  time,
  reason,
}: {
  recipientEmail: string;
  recipientName: string;
  cancelledByRole: string;
  date: string;
  time: string;
  reason: string;
}) {
  return sendEmail({
    to: recipientEmail,
    subject: 'Appointment Cancelled — MediBook',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Appointment Cancelled</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${recipientName}</strong>,</p>
          <p style="color: #374151;">Your appointment on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled by the <strong>${cancelledByRole}</strong>.</p>
          <div style="background: white; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If a payment was made, a refund will be processed within 5-7 business days.</p>
        </div>
      </div>
    `,
  });
}

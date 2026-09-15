import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID ||
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TO_EMAIL = (
  import.meta.env.VITE_CONTACT_EMAIL || "contact@rojob.eu"
).trim();

export function isContactEmailConfigured() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY && TO_EMAIL);
}

/**
 * Send a contact / trade enquiry to contact@rojob.eu via EmailJS.
 * Template fields: To {{to_email}}, Reply-To {{reply_to}}, Subject {{subject}}
 * Body can use {{from_name}}, {{customer_email}}, {{department}}, {{message}}
 */
export async function sendContactEmail({
  name = "",
  email,
  message,
  department = "general",
}) {
  if (!isContactEmailConfigured()) {
    throw new Error("Email is not configured.");
  }
  if (!email?.trim() || !message?.trim()) {
    throw new Error("Email and message are required.");
  }

  const fromName = name.trim() || "ROJOB website";
  const customerEmail = email.trim().toLowerCase();
  const dept = String(department || "general");

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: TO_EMAIL,
      reply_to: customerEmail,
      subject: `ROJOB contact — ${dept}`,
      from_name: fromName,
      customer_email: customerEmail,
      department: dept,
      message: message.trim(),
      // Aliases for common EmailJS starter templates
      name: fromName,
      email: customerEmail,
      title: `ROJOB contact — ${dept}`,
    },
    { publicKey: PUBLIC_KEY }
  );

  return { to: TO_EMAIL };
}

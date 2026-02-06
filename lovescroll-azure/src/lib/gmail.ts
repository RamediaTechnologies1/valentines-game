import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

function getGmailClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    scopes: SCOPES,
    subject: process.env.GMAIL_SEND_FROM!, // the workspace email to send as
  });

  return google.gmail({ version: "v1", auth });
}

function createRawEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.GMAIL_SEND_FROM!;
  const boundary = "boundary_" + Date.now();

  const messageParts = [
    `From: LoveScroll by Ramedia <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    html,
    "",
    `--${boundary}--`,
  ];

  const rawMessage = messageParts.join("\r\n");

  // Base64url encode
  return Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const gmail = getGmailClient();
  const raw = createRawEmail({ to, subject, html });

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return result.data;
}

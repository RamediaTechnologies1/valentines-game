interface DeliveryEmailProps {
  toName: string;
  fromName: string;
  linkUrl: string;
}

export function generateDeliveryEmail({
  toName,
  fromName,
  linkUrl,
}: DeliveryEmailProps): { subject: string; html: string } {
  const subject = `${fromName} made something special for you 💕`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone special made this for you</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Georgia','Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Sparkle -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="font-size:28px;">✦</span>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:26px;font-weight:bold;color:#ffffff;line-height:1.3;">
                ${toName},
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom:30px;">
              <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.5);line-height:1.6;">
                ${fromName} created something beautiful<br>just for you.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(244,63,94,0.4),transparent);"></div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="${linkUrl}" 
                 style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;border-radius:50px;font-family:Arial,sans-serif;">
                Open Your Experience →
              </a>
            </td>
          </tr>

          <!-- Tip -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.2);line-height:1.5;">
                💡 Best experienced on your phone<br>with sound on and lights dimmed.
              </p>
            </td>
          </tr>

          <!-- Footer divider -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <div style="width:100%;height:1px;background:rgba(255,255,255,0.05);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.15);line-height:1.5;">
                Made with ♥ by <a href="https://ramedia.com" style="color:rgba(244,63,94,0.4);text-decoration:none;">Ramedia</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

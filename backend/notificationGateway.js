/**
 * NEXINFRA MULTI-CHANNEL DISASTER NOTIFICATION GATEWAY
 * Supports Twilio, Fast2SMS (India), MSG91, Resend, and SendGrid
 */

// 1. Send SMS via Twilio
export async function sendTwilioSMS(toPhone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    return { success: false, reason: "Twilio credentials not configured in backend/.env" };
  }

  try {
    const formattedTo = toPhone.replace(/\s+/g, "");
    const bodyParams = new URLSearchParams({
      To: formattedTo,
      From: fromPhone,
      Body: message
    });

    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, provider: "Twilio", sid: data.sid };
    } else {
      return { success: false, provider: "Twilio", error: data.message };
    }
  } catch (err) {
    return { success: false, provider: "Twilio", error: err.message };
  }
}

// 2. Send SMS via Fast2SMS (India Quick SMS Gateway)
export async function sendFast2SMS(numbersArray, message) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return { success: false, reason: "FAST2SMS_API_KEY not configured" };
  }

  try {
    const cleanNumbers = numbersArray
      .map(n => n.replace(/[^0-9]/g, "").slice(-10))
      .filter(n => n.length === 10)
      .join(",");

    if (!cleanNumbers) {
      return { success: false, error: "No valid 10-digit Indian phone numbers provided" };
    }

    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: cleanNumbers
      })
    });

    const data = await res.json();
    console.log("Fast2SMS Response:", data);
    return { success: res.ok && data.return === true, provider: "Fast2SMS", data };
  } catch (err) {
    console.error("Fast2SMS Error:", err);
    return { success: false, provider: "Fast2SMS", error: err.message };
  }
}

// 3. Send Email via Resend
export async function sendResendEmail(toEmail, subject, htmlContent) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, reason: "RESEND_API_KEY not configured in backend/.env" };
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || "NEXinfra Emergency <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: subject,
        html: htmlContent
      })
    });

    const data = await res.json();
    return { success: res.ok, provider: "Resend", data };
  } catch (err) {
    return { success: false, provider: "Resend", error: err.message };
  }
}

// 4. Send Email via SendGrid
export async function sendSendGridEmail(toEmail, subject, textContent, htmlContent) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return { success: false, reason: "SENDGRID_API_KEY not configured in backend/.env" };
  }

  try {
    const fromAddress = process.env.SENDGRID_FROM_EMAIL || "alerts@nexinfra.org";
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromAddress, name: "NEXinfra Disaster Command" },
        subject: subject,
        content: [
          { type: "text/plain", value: textContent },
          { type: "text/html", value: htmlContent }
        ]
      })
    });

    return { success: res.ok, provider: "SendGrid", status: res.status };
  } catch (err) {
    return { success: false, provider: "SendGrid", error: err.message };
  }
}

/**
 * Multi-Channel Broadcast Orchestrator
 * Iterates through all targeted recipients and dispatches real SMS + Email alerts
 */
export async function dispatchRealWorldEmergencyAlerts({
  recipients = [],
  disasterType,
  epicenterLocation,
  shelterLocation,
  radiusKm,
  message
}) {
  const results = {
    smsDispatched: 0,
    smsFailed: 0,
    emailDispatched: 0,
    emailFailed: 0,
    providersUsed: [],
    details: []
  };

  const subject = `🚨 CRITICAL LEVEL 5 ALERT: ${disasterType.toUpperCase()}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; background: #070A12; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 2px solid #EF4444;">
      <div style="background: #7F1D1D; color: #FEE2E2; padding: 12px 18px; border-radius: 8px; font-size: 16px; font-weight: bold; margin-bottom: 16px;">
        🚨 NEXINFRA LEVEL 5 DISASTER WARNING & EVACUATION ORDER
      </div>
      <h2 style="color: #F87171; margin-top: 0;">${disasterType}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #E2E8F0;">
        ${message}
      </p>
      <div style="background: #1E293B; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 4px 0;"><strong>📍 Epicenter:</strong> ${epicenterLocation}</p>
        <p style="margin: 4px 0;"><strong>🏃 Safe Evacuation Center:</strong> ${shelterLocation}</p>
        <p style="margin: 4px 0;"><strong>⚠️ Hazard Perimeter:</strong> ${radiusKm} km radius</p>
        <p style="margin: 4px 0;"><strong>📞 Emergency Helplines:</strong> 112 / 108 / 100</p>
      </div>
      <p style="font-size: 11px; color: #94A3B8; margin-top: 20px;">
        Dispatched automatically by NEXinfra Real-Time Civic Infrastructure & Disaster Command Matrix.
      </p>
    </div>
  `;

  // 1. Bulk SMS Dispatch via Fast2SMS (if key present)
  if (process.env.FAST2SMS_API_KEY) {
    const phones = recipients.map(c => c.phone).filter(Boolean);
    if (phones.length > 0) {
      const smsRes = await sendFast2SMS(phones, message);
      if (smsRes.success) {
        results.smsDispatched += phones.length;
        if (!results.providersUsed.includes("Fast2SMS")) results.providersUsed.push("Fast2SMS");
      } else {
        results.smsFailed += phones.length;
      }
    }
  }

  // 2. Individual Dispatches (Twilio & Emails)
  for (const citizen of recipients) {
    // Twilio SMS
    if (citizen.phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const smsRes = await sendTwilioSMS(citizen.phone, message);
      if (smsRes.success) {
        results.smsDispatched++;
        if (!results.providersUsed.includes("Twilio")) results.providersUsed.push("Twilio");
      } else {
        results.smsFailed++;
      }
    }

    // Email Dispatch (Resend or SendGrid)
    if (citizen.email) {
      if (process.env.RESEND_API_KEY) {
        const emailRes = await sendResendEmail(citizen.email, subject, htmlBody);
        if (emailRes.success) {
          results.emailDispatched++;
          if (!results.providersUsed.includes("Resend")) results.providersUsed.push("Resend");
        } else {
          results.emailFailed++;
        }
      } else if (process.env.SENDGRID_API_KEY) {
        const emailRes = await sendSendGridEmail(citizen.email, subject, message, htmlBody);
        if (emailRes.success) {
          results.emailDispatched++;
          if (!results.providersUsed.includes("SendGrid")) results.providersUsed.push("SendGrid");
        } else {
          results.emailFailed++;
        }
      }
    }
  }

  return results;
}

// functions/api/careers.js - FINAL REUSABLE - Based on your pilot.js pattern
// Sends TWO emails like pilot.js: internal + auto-reply
// Put at: functions/api/careers.js
// Env vars: RESEND_API_KEY, TO_EMAIL, FROM_EMAIL (same as pilot.js)
// Uses: https://api.resend.com/emails

export async function onRequestPost(context) {
  const { request, env } = context;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
      return json({ ok: false, error: "Server env vars missing: RESEND_API_KEY, TO_EMAIL, FROM_EMAIL" }, 500, cors);
    }

    const data = await request.json();
    const jobSlug = (data.jobSlug || data.job_slug || "general").trim();
    const jobTitle = (data.jobTitle || data.job_title || jobSlug).trim();
    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const whatsapp = (data.whatsapp || "").trim();
    const location = (data.location || "").trim();
    const linkedin = (data.linkedin || "").trim();
    const cvLink = (data.cvLink || "").trim();
    const experience = (data.experience || "").trim();
    const investment = (data.investment || "").trim();
    const why = (data.why || "").trim();
    const currentRole = (data.currentRole || "").trim();
    const honey = (data._honeypot || "").trim();

    if (honey) return json({ ok: true }, 200, cors);
    if (!name || !email || !jobSlug) {
      return json({ ok: false, error: "Missing required: name, email, jobSlug" }, 400, cors);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "n/a";
    const country = request.headers.get("CF-IPCountry") || "n/a";
    const firstName = name.split(" ")[0];

    // INTERNAL EMAIL - to you
    const internalHtml = `
<div style="font-family:-apple-system,system-ui,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;">
  <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:2rem;color:#fff;">
    <h1 style="margin:0;font-size:1.5rem;">💼 New Application: ${esc(jobTitle)}</h1>
    <p style="margin:0.5rem 0 0;opacity:0.9;">${esc(jobSlug)} · bdcrops.com/careers/${esc(jobSlug)}</p>
  </div>
  <div style="background:#fff;padding:2rem;border:1px solid #e2e8f0;border-top:none;">
    <table style="width:100%;border-collapse:collapse;">
      ${row("Job", `${esc(jobTitle)} (${esc(jobSlug)})`)}
      ${row("Name", esc(name))}
      ${row("Email", `<a href="mailto:${esc(email)}" style="color:#0f172a;">${esc(email)}</a>`)}
      ${whatsapp ? row("WhatsApp", `<a href="https://wa.me/${esc(whatsapp.replace(/\D/g,''))}">${esc(whatsapp)}</a>`) : ""}
      ${row("Location", esc(location))}
      ${linkedin ? row("LinkedIn", `<a href="${esc(linkedin)}">${esc(linkedin)}</a>`) : ""}
      ${cvLink ? row("CV Link", `<a href="${esc(cvLink)}" style="color:#2563eb;font-weight:700;">${esc(cvLink)}</a>`, "top") : ""}
      ${experience ? row("Experience", esc(experience)) : ""}
      ${investment ? row("$10k Loan", `<strong>${esc(investment)}</strong>`) : ""}
      ${currentRole ? row("Current Role", esc(currentRole)) : ""}
      ${why ? row("Why CEO 50%", esc(why).replace(/\n/g,'<br>'), "top") : ""}
    </table>
    <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:0.8rem;color:#94a3b8;">
      Received: ${new Date().toUTCString()} · IP: ${ip} · Country: ${country} · Slug: ${esc(jobSlug)}
    </div>
    <div style="margin-top:1.5rem;text-align:center;">
      <a href="https://wa.me/${esc((whatsapp||'').replace(/\D/g,''))}" style="display:inline-block;background:#0f172a;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;margin:0.25rem;">💬 WhatsApp</a>
      <a href="mailto:${esc(email)}?subject=Re:%20Your%20${encodeURIComponent(jobTitle)}%20Application" style="display:inline-block;background:#fbbf24;color:#0f172a;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;margin:0.25rem;">✉ Reply</a>
    </div>
  </div>
</div>`;

    // AUTO-REPLY to applicant
    const userHtml = `
<div style="font-family:-apple-system,system-ui,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;">
  <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:2.5rem 2rem;color:#fff;text-align:center;">
    <div style="font-size:2.5rem;margin-bottom:0.5rem;">🚀</div>
    <h1 style="margin:0;font-size:1.6rem;">Thank you, ${esc(firstName)}!</h1>
    <p style="margin:0.75rem 0 0;opacity:0.95;">Your application for ${esc(jobTitle)} received</p>
  </div>
  <div style="background:#fff;padding:2rem;border:1px solid #e2e8f0;border-top:none;">
    <p style="font-size:1.05rem;line-height:1.6;color:#0f172a;">Assalamu alaikum <strong>${esc(firstName)} bhai</strong>,</p>
    <p style="line-height:1.7;color:#334155;">Thank you for applying for <strong>${esc(jobTitle)}</strong> at BDCrops. We've received your application and CV link.</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:1.25rem 1.5rem;margin:1.5rem 0;border-radius:6px;">
      <h3 style="margin:0 0 0.75rem;color:#15803d;">📋 What next?</h3>
      <ol style="margin:0;padding-left:1.25rem;color:#334155;line-height:1.8;">
        <li>Team reviews within <strong>48 hours</strong></li>
        <li>If shortlisted, we send NDA + detailed deck</li>
        <li>Intro call to know each other</li>
        <li>Deep dive & co-founding agreement</li>
      </ol>
    </div>
    <p style="color:#64748b;font-size:0.9rem;">Job: ${esc(jobTitle)} | CV: ${esc(cvLink)} | Location: ${esc(location)}</p>
    <div style="margin-top:1.5rem;text-align:center;">
      <a href="https://wa.me/8801717676441" style="display:inline-block;background:#22c55e;color:#fff;padding:0.85rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;">💬 WhatsApp: +880 1717 676441</a>
    </div>
    <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#334155;">Warm regards,<br><strong>Abdul Matin</strong><br><span style="color:#64748b;font-size:0.9rem;">Founder, BDCrops</span></p>
    </div>
  </div>
</div>`;

    const send = (payload) => fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const [internalRes, userRes] = await Promise.all([
      send({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        reply_to: email,
        subject: `💼 [${jobTitle}] ${name} · ${experience || ""} · ${investment || ""}`.trim(),
        html: internalHtml,
      }),
      send({
        from: `BDCrops Careers <${env.FROM_EMAIL.replace(/^.*<|>$/g,'')}>`,
        to: [email],
        reply_to: env.TO_EMAIL,
        subject: `✅ Thanks ${firstName}! Your ${jobTitle} application received`,
        html: userHtml,
      }),
    ]);

    if (!internalRes.ok) {
      const body = await internalRes.text();
      return json({ ok: false, error: "Internal email failed", details: body }, 500, cors);
    }

    return json({ ok: true, message: "Application received" }, 200, cors);

  } catch (err) {
    return json({ ok: false, error: err.message }, 500, cors);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}

function esc(s){ return String(s||"").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function row(label, value, valign="middle"){
  return `<tr><td style="padding:0.75rem;color:#64748b;font-weight:600;width:150px;border-bottom:1px solid #f1f5f9;vertical-align:${valign};">${label}</td><td style="padding:0.75rem;color:#0f172a;border-bottom:1px solid #f1f5f9;vertical-align:${valign};">${value}</td></tr>`;
}
function json(obj, status, headers){ return new Response(JSON.stringify(obj), { status, headers }); }

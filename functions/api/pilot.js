// Cloudflare Pages Function — Pilot form handler
// Sends TWO emails:
//   1. Notification to matin@bdcrops.com (internal)
//   2. Auto-reply to the user (thank you + next steps)

export async function onRequestPost(context) {
    const { request, env } = context;
    const cors = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    };

    try {
        if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
            return json({ ok: false, error: "Server env vars missing" }, 500, cors);
        }

        const data = await request.json();
        const name     = (data.name     || "").trim();
        const email    = (data.email    || "").trim();
        const org      = (data.org      || "").trim();
        const whatsapp = (data.whatsapp || "").trim();
        const location = (data.location || "").trim();
        const goal     = (data.goal     || "").trim();
        const honey    = (data._honeypot|| "").trim();

        if (honey) return json({ ok: true }, 200, cors); // silent bot reject

        if (!name || !email || !location || !goal) {
            return json({ ok: false, error: "Missing required fields: name, email, location, goal" }, 400, cors);
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return json({ ok: false, error: "Invalid email format" }, 400, cors);
        }

        const ip      = request.headers.get("CF-Connecting-IP") || "n/a";
        const country = request.headers.get("CF-IPCountry")     || "n/a";
        const firstName = name.split(" ")[0];

        // ─── EMAIL 1: Notify you (internal) ───────────────────────
        const internalHtml = `
<div style="font-family:-apple-system,system-ui,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;">
  <div style="background:linear-gradient(135deg,#22c55e,#15803d);padding:2rem;color:#fff;">
    <h1 style="margin:0;font-size:1.5rem;">🛰️ New Pilot Request</h1>
    <p style="margin:0.5rem 0 0;opacity:0.9;">BDCrops · Satellite Intelligence for Agriculture</p>
  </div>
  <div style="background:#fff;padding:2rem;border:1px solid #e2e8f0;border-top:none;">
    <table style="width:100%;border-collapse:collapse;">
      ${row("Name", esc(name))}
      ${row("Email", `<a href="mailto:${esc(email)}" style="color:#22c55e;">${esc(email)}</a>`)}
      ${org      ? row("Organization", esc(org)) : ""}
      ${whatsapp ? row("WhatsApp", `<a href="https://wa.me/${esc(whatsapp.replace(/\D/g,''))}" style="color:#22c55e;">${esc(whatsapp)}</a>`) : ""}
      ${row("Location", esc(location))}
      ${row("Goal", esc(goal).replace(/\n/g,'<br>'), "top")}
    </table>
    <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:0.8rem;color:#94a3b8;">
      Received: ${new Date().toUTCString()} · IP: ${ip} · Country: ${country}
    </div>
    <div style="margin-top:1.5rem;text-align:center;">
      <a href="https://wa.me/${esc((whatsapp||'8801717676441').replace(/\D/g,''))}" style="display:inline-block;background:#22c55e;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;margin:0.25rem;">💬 WhatsApp Lead</a>
      <a href="mailto:${esc(email)}?subject=Re:%20Your%20BDCrops%20Pilot%20Request" style="display:inline-block;background:#0f172a;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;margin:0.25rem;">✉ Reply Email</a>
    </div>
    <p style="margin-top:1rem;font-size:0.85rem;color:#64748b;text-align:center;">
      ✅ Auto-reply already sent to ${esc(email)}
    </p>
  </div>
</div>`;

        // ─── EMAIL 2: Auto-reply to the user ──────────────────────
        const userHtml = `
<div style="font-family:-apple-system,system-ui,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;">
  <div style="background:linear-gradient(135deg,#22c55e,#15803d);padding:2.5rem 2rem;color:#fff;text-align:center;">
    <div style="font-size:3rem;margin-bottom:0.5rem;">🛰️🌾</div>
    <h1 style="margin:0;font-size:1.75rem;">Thank you, ${esc(firstName)}!</h1>
    <p style="margin:0.75rem 0 0;opacity:0.95;font-size:1.05rem;">Your pilot request has been received</p>
  </div>

  <div style="background:#fff;padding:2rem;border:1px solid #e2e8f0;border-top:none;">

    <p style="font-size:1.05rem;line-height:1.6;color:#0f172a;margin:0 0 1.25rem;">
      Assalamu alaikum <strong>${esc(firstName)} bhai</strong>,
    </p>

    <p style="font-size:1rem;line-height:1.7;color:#334155;">
      ধন্যবাদ BDCrops-এ যোগাযোগ করার জন্য! Thank you for your interest in
      <strong>BDCrops — Satellite Intelligence for Bangladesh Agriculture</strong>.
      We've received your pilot request and our team is already reviewing it.
    </p>

    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:1.25rem 1.5rem;margin:1.5rem 0;border-radius:6px;">
      <h3 style="margin:0 0 0.75rem;color:#15803d;font-size:1rem;">📋 What happens next?</h3>
      <ol style="margin:0;padding-left:1.25rem;color:#334155;line-height:1.8;">
        <li>Our team reviews your request within <strong>24 hours</strong></li>
        <li>We prepare an <strong>8-band satellite analysis</strong> for your target location</li>
        <li>You receive a full PDF report + interactive dashboard access</li>
        <li>We schedule a call to discuss findings &amp; next steps</li>
      </ol>
    </div>

    <h3 style="color:#0f172a;font-size:1.05rem;margin:1.5rem 0 0.75rem;">📝 Your Request Summary</h3>
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
      ${row("Name", esc(name))}
      ${row("Email", esc(email))}
      ${org      ? row("Organization", esc(org)) : ""}
      ${whatsapp ? row("WhatsApp", esc(whatsapp)) : ""}
      ${row("Location", esc(location))}
      ${row("Goal", esc(goal).replace(/\n/g,'<br>'), "top")}
    </table>

    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:10px;padding:1.5rem;margin:1.5rem 0;text-align:center;">
      <h3 style="margin:0 0 0.75rem;color:#15803d;">💬 Need to reach us faster?</h3>
      <p style="margin:0 0 1rem;color:#334155;">WhatsApp gives fastest response (usually within 1 hour)</p>
      <a href="https://wa.me/8801717676441" style="display:inline-block;background:#22c55e;color:#fff;padding:0.85rem 1.75rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:1.05rem;">💬 WhatsApp: +880 1717 676441</a>
    </div>

    <h3 style="color:#0f172a;font-size:1.05rem;margin:1.5rem 0 0.75rem;">🌐 Explore while you wait</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:0.6rem 0;"><a href="https://bdcrops.com/pages/8band-report.html" style="color:#22c55e;text-decoration:none;font-weight:600;">🛰️ 8-Band Satellite Report →</a></td>
      </tr>
      <tr>
        <td style="padding:0.6rem 0;"><a href="https://bdcrops.com/pages/aquacrop.html" style="color:#22c55e;text-decoration:none;font-weight:600;">💧 AquaCrop Digital Twin →</a></td>
      </tr>
      <tr>
        <td style="padding:0.6rem 0;"><a href="https://bdcrops.com/pages/use-case-rice.html" style="color:#22c55e;text-decoration:none;font-weight:600;">🌾 Rice Monitoring Use Case →</a></td>
      </tr>
      <tr>
        <td style="padding:0.6rem 0;"><a href="https://bdcrops.com/pages/about.html" style="color:#22c55e;text-decoration:none;font-weight:600;">🏢 About BDCrops Technologies →</a></td>
      </tr>
    </table>

    <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#334155;line-height:1.6;">
        Warm regards,<br>
        <strong style="color:#0f172a;">Abdul Matin</strong><br>
        <span style="color:#64748b;font-size:0.9rem;">Founder, BDCrops Technologies</span>
      </p>
      <div style="margin-top:1rem;font-size:0.85rem;color:#64748b;">
        📧 <a href="mailto:matin@bdcrops.com" style="color:#22c55e;">matin@bdcrops.com</a> ·
        🌐 <a href="https://bdcrops.com" style="color:#22c55e;">bdcrops.com</a> ·
        💬 <a href="https://wa.me/8801717676441" style="color:#22c55e;">+880 1717 676441</a>
      </div>
    </div>

    <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #e2e8f0;text-align:center;font-size:0.75rem;color:#94a3b8;">
      BDCrops Technologies · Dhaka, Bangladesh 🇧🇩<br>
      Powered by Sentinel-2 · Microsoft Planetary Computer · Open Source
    </div>
  </div>
</div>`;

        // ─── Send both emails in parallel ────────────────────────
        const send = (payload) => fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const [internalRes, userRes] = await Promise.all([
            send({
                from: env.FROM_EMAIL,
                to: [env.TO_EMAIL],
                reply_to: email,
                subject: `🛰️ Pilot — ${name}${org ? " · "+org : ""} · ${location.substring(0,40)}`,
                html: internalHtml,
            }),
            send({
                from: `BDCrops Pilot <${env.FROM_EMAIL.replace(/^.*<|>$/g,'')}>`,
                to: [email],
                reply_to: env.TO_EMAIL,  // replies go to matin@bdcrops.com
                subject: `🛰️ Thanks ${firstName}! Your BDCrops pilot request received`,
                html: userHtml,
            }),
        ]);

        // If either failed, return error (but don't block)
        if (!internalRes.ok) {
            const body = await internalRes.text();
            return json({ ok: false, error: "Internal email failed", details: body }, 500, cors);
        }
        // User email failure is non-critical — internal already sent
        const userOk = userRes.ok;

        return json({
            ok: true,
            message: userOk
                ? "Request received. Check your inbox for confirmation."
                : "Request received (confirmation email may be delayed)."
        }, 200, cors);

    } catch (err) {
        return json({ ok: false, error: err.message }, 500, cors);
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

function esc(s) {
    return String(s || "").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function row(label, value, valign = "middle") {
    return `<tr>
      <td style="padding:0.75rem;color:#64748b;font-weight:600;width:130px;border-bottom:1px solid #f1f5f9;vertical-align:${valign};">${label}</td>
      <td style="padding:0.75rem;color:#0f172a;border-bottom:1px solid #f1f5f9;vertical-align:${valign};">${value}</td>
    </tr>`;
}
function json(obj, status, headers) {
    return new Response(JSON.stringify(obj), { status, headers });
}

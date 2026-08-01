// Cloudflare Pages Function — handles pilot form submissions
// Endpoint: POST /api/pilot
// Env vars needed (set in CF Pages dashboard):
//   RESEND_API_KEY  → get free at resend.com
//   TO_EMAIL        → matin@bdcrops.com
//   FROM_EMAIL      → noreply@bdcrops.com (must be verified in Resend)

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS + JSON
    const cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    try {
        const data = await request.json();
        const { name, email, org, whatsapp, location, goal, _honeypot } = data;

        // Honeypot — reject bots
        if (_honeypot) {
            return new Response(JSON.stringify({ ok: true }), { headers: cors });
        }

        // Basic validation
        if (!name || !email || !location) {
            return new Response(
                JSON.stringify({ ok: false, error: "Missing required fields" }),
                { status: 400, headers: cors }
            );
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(
                JSON.stringify({ ok: false, error: "Invalid email" }),
                { status: 400, headers: cors }
            );
        }

        // Build email HTML
        const html = `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#22c55e,#15803d);padding:2rem;border-radius:12px 12px 0 0;">
                <h1 style="color:#fff;margin:0;font-size:1.5rem;">🛰️ New Pilot Request</h1>
                <p style="color:#dcfce7;margin:0.5rem 0 0;">BDCrops · Satellite Intelligence</p>
              </div>
              <div style="background:#fff;padding:2rem;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:0.75rem 0;color:#64748b;width:120px;"><strong>Name</strong></td><td>${escape(name)}</td></tr>
                  <tr><td style="padding:0.75rem 0;color:#64748b;"><strong>Email</strong></td><td><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
                  <tr><td style="padding:0.75rem 0;color:#64748b;"><strong>Organization</strong></td><td>${escape(org || "—")}</td></tr>
                  <tr><td style="padding:0.75rem 0;color:#64748b;"><strong>WhatsApp</strong></td><td>${escape(whatsapp || "—")}</td></tr>
                  <tr><td style="padding:0.75rem 0;color:#64748b;"><strong>Location</strong></td><td>${escape(location)}</td></tr>
                  <tr><td style="padding:0.75rem 0;color:#64748b;vertical-align:top;"><strong>Goal</strong></td><td>${escape(goal || "—").replace(/\n/g, "<br>")}</td></tr>
                </table>
                <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:0.85rem;">
                  Received: ${new Date().toISOString()} · IP: ${request.headers.get("CF-Connecting-IP") || "n/a"} · Country: ${request.headers.get("CF-IPCountry") || "n/a"}
                </div>
              </div>
            </div>
        `;

        // Send via Resend API
        const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: `BDCrops Pilot <${env.FROM_EMAIL}>`,
                to: [env.TO_EMAIL],
                reply_to: email,
                subject: `🛰️ Pilot Request — ${name}${org ? " (" + org + ")" : ""}`,
                html,
            }),
        });

        if (!resendRes.ok) {
            const err = await resendRes.text();
            console.error("Resend error:", err);
            return new Response(
                JSON.stringify({ ok: false, error: "Email service failed" }),
                { status: 500, headers: cors }
            );
        }

        return new Response(JSON.stringify({ ok: true }), { headers: cors });

    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ ok: false, error: "Server error" }),
            { status: 500, headers: cors }
        );
    }
}

// CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

function escape(str) {
    return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

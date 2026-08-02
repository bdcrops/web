// Pilot form handler + GA4 conversion tracking
async function submitPilot(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById("pilot-submit");
    const status = document.getElementById("pilot-status");

    const fd = new FormData(form);
    const data = {
        name:     (fd.get("name")     || "").trim(),
        email:    (fd.get("email")    || "").trim(),
        org:      (fd.get("org")      || "").trim(),
        whatsapp: (fd.get("whatsapp") || "").trim(),
        location: (fd.get("location") || "").trim(),
        goal:     (fd.get("goal")     || "").trim(),
        _honeypot:(fd.get("_honeypot")|| "").trim(),
    };

    // Client-side validation
    if (!data.name || !data.email || !data.location || !data.goal) {
        status.innerHTML = "⚠ Please fill in Name, Email, Location, and Goal.";
        status.className = "pilot-status error";

        // Track validation failure
        if (typeof gtag === 'function') {
            gtag('event', 'form_validation_error', {
                'event_category': 'pilot_form',
                'event_label': 'missing_required_fields'
            });
        }
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        status.innerHTML = "⚠ Please enter a valid email address.";
        status.className = "pilot-status error";
        return false;
    }

    // Track form submission attempt
    if (typeof gtag === 'function') {
        gtag('event', 'pilot_form_submit_attempt', {
            'event_category': 'pilot_form',
            'has_org': !!data.org,
            'has_whatsapp': !!data.whatsapp
        });
    }

    // UI: loading
    btn.disabled = true;
    btn.textContent = "Sending...";
    status.textContent = "";
    status.className = "pilot-status";

    try {
        const res = await fetch("/api/pilot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        console.log("Pilot response:", json);

        if (json.ok) {
            status.innerHTML = "✅ <strong>Thanks!</strong> We'll respond within 24 hours via email & WhatsApp.";
            status.className = "pilot-status success";
            form.reset();
            btn.textContent = "Sent ✓";

            // 🎯 CONVERSION EVENT — track successful pilot submission
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'pilot_form',
                    'event_label': 'pilot_request_success',
                    'value': 1,
                    'currency': 'USD'
                });
                gtag('event', 'conversion', {
                    'event_category': 'pilot_form',
                    'send_to': 'G-Q3EJLRP1KF'
                });
            }

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = "Send Pilot Request";
            }, 5000);
        } else {
            const errMsg = json.error || "Submission failed";
            const hint = json.debug?.hint || "";
            status.innerHTML = `⚠ ${errMsg}${hint ? '<br><small style="opacity:0.85;">' + hint + '</small>' : ''}<br><small>Or WhatsApp us: <a href="https://wa.me/8801717676441" style="color:inherit;text-decoration:underline;">+880 1717 676441</a></small>`;
            status.className = "pilot-status error";
            btn.disabled = false;
            btn.textContent = "Send Pilot Request";

            // Track failure
            if (typeof gtag === 'function') {
                gtag('event', 'pilot_form_submit_error', {
                    'event_category': 'pilot_form',
                    'event_label': errMsg
                });
            }
        }
    } catch (err) {
        console.error("Pilot form error:", err);
        status.innerHTML = `⚠ Network error — please try WhatsApp: <a href="https://wa.me/8801717676441" style="color:inherit;text-decoration:underline;">+880 1717 676441</a>`;
        status.className = "pilot-status error";
        btn.disabled = false;
        btn.textContent = "Send Pilot Request";

        if (typeof gtag === 'function') {
            gtag('event', 'pilot_form_network_error', {
                'event_category': 'pilot_form',
                'event_label': err.message
            });
        }
    }
    return false;
}

// ─── Track outbound clicks (WhatsApp, email, external links) ────
document.addEventListener('DOMContentLoaded', function() {
    // WhatsApp click tracking
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag === 'function') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'engagement',
                    'event_label': this.href
                });
            }
        });
    });

    // Email click tracking
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag === 'function') {
                gtag('event', 'email_click', {
                    'event_category': 'engagement',
                    'event_label': this.href.replace('mailto:', '')
                });
            }
        });
    });

    // Track scroll depth (25%, 50%, 75%, 100%)
    let scrollMarks = { 25: false, 50: false, 75: false, 100: false };
    window.addEventListener('scroll', function() {
        const pct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
        [25, 50, 75, 100].forEach(mark => {
            if (pct >= mark && !scrollMarks[mark]) {
                scrollMarks[mark] = true;
                if (typeof gtag === 'function') {
                    gtag('event', 'scroll_depth', {
                        'event_category': 'engagement',
                        'event_label': mark + '%',
                        'value': mark
                    });
                }
            }
        });
    }, { passive: true });
});

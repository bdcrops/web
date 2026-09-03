// File: https://bdcrops.com/js/cofounder-form.js
// Location on server: /public/js/cofounder-form.js or /js/cofounder-form.js (same folder as pilot-form.js)
// White background version + CV Drive link + Apply Now + fixed API error handling

async function submitCofounder(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById("pilot-submit");
  const status = document.getElementById("pilot-status");
  const fd = new FormData(form);
  
  const data = {
    name: (fd.get("name") || "").trim(),
    email: (fd.get("email") || "").trim(),
    whatsapp: (fd.get("whatsapp") || "").trim(),
    linkedin: (fd.get("linkedin") || "").trim(),
    cvlink: (fd.get("cvlink") || "").trim(), // Google Drive / OneDrive / Dropbox
    location: (fd.get("location") || "").trim(),
    investment: (fd.get("investment") || "").trim(),
    experience: (fd.get("experience") || "").trim(),
    q1: (fd.get("q1") || "").trim(),
    q2: (fd.get("q2") || "").trim(),
    q3: (fd.get("q3") || "").trim(),
    _honeypot: (fd.get("_honeypot") || "").trim()
  };

  // Validation – including CV link
  if (!data.name || !data.email || !data.location || !data.cvlink || !data.q1 || !data.q2 || !data.q3) {
    status.innerHTML = "⚠ Please fill all * fields including CV Drive link.";
    status.className = "pilot-status error";
    status.style.display = "block";
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    status.innerHTML = "⚠ Please enter a valid email address.";
    status.className = "pilot-status error";
    status.style.display = "block";
    return false;
  }
  // Optional: validate Drive link format
  if (!data.cvlink.includes("drive.google.com") && !data.cvlink.includes("1drv.ms") && !data.cvlink.includes("dropbox.com") && !data.cvlink.includes("docs.google.com")) {
    // Allow any URL but warn
    console.warn("CV link is not a known Drive/OneDrive/Dropbox URL, but allowing:", data.cvlink);
  }

  if (typeof gtag === 'function') {
    gtag('event', 'cofounder_form_submit_attempt', {
      'event_category': 'cofounder_form',
      'has_cvlink': !!data.cvlink
    });
  }

  btn.disabled = true;
  btn.textContent = "Sending...";
  status.textContent = "";
  status.className = "pilot-status";
  status.style.display = "none";

  try {
    const res = await fetch("/api/cofounder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    console.log("Co-founder response:", json);

    if (json.ok) {
      status.innerHTML = "✅ <strong>Application Received!</strong> You applied via Apply Now on bdcrops.com – We'll respond within 24 hours via email & WhatsApp.<br>CV: <a href='" + data.cvlink + "' target='_blank' style='color:inherit;text-decoration:underline'>" + data.cvlink + "</a>";
      status.className = "pilot-status success";
      status.style.display = "block";
      form.reset();
      btn.textContent = "Sent ✓";

      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          'event_category': 'cofounder_form',
          'event_label': 'cofounder_apply_success',
          'value': 1
        });
      }

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "🚀 Apply Now";
      }, 5000);
    } else {
      throw new Error(json.error || "Submission failed");
    }
  } catch (err) {
    console.error("Co-founder form – API not ready, fallback to email:", err);
    // FIXED: Auto-open email instead of showing red error
    const mailto = `mailto:hr@bdcrops.com?subject=Co-Founder CEO – ${encodeURIComponent(data.name)} – Apply Now&body=${encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nWhatsApp: ${data.whatsapp}\nLinkedIn: ${data.linkedin}\nCV Link (Google Drive/OneDrive/Dropbox): ${data.cvlink}\nLocation: ${data.location}\nInvestment $10k+ Loan?: ${data.investment}\nExperience: ${data.experience}\n\nQ1 Why Co-Founder CEO instead of salaried role?\n${data.q1}\n\nQ2 Plan to generate first customers & revenue in 6-12 months?\n${data.q2}\n\nQ3 Prepared to invest $10k+ and commit time?\n${data.q3}\n\n---\nApplied via bdcrops.com/careers/cf-ceo.html#cofounder-apply – Apply Now`
    )}`;
    window.location.href = mailto;
    status.innerHTML = `✅ <strong>Opening your email client...</strong><br>Your application is ready to send to <strong>hr@bdcrops.com</strong><br>CV Link: <a href="${data.cvlink}" target="_blank" style="color:inherit;text-decoration:underline;font-weight:700">${data.cvlink}</a><br><br>If email didn't open, <a href="${mailto}" style="color:inherit;text-decoration:underline;font-weight:700">click here to Email Application Now</a>`;
    status.className = "pilot-status success";
    status.style.display = "block";
    btn.disabled = false;
    btn.textContent = "✅ Email Ready – Send Now";

    if (typeof gtag === 'function') {
      gtag('event', 'cofounder_form_email_fallback', {
        'event_category': 'cofounder_form',
        'event_label': 'api_not_ready'
      });
    }
  }
  return false;
}

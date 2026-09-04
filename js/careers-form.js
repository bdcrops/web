// /js/careers-form.js - FINAL - No rocket, No personal name, $2k model, Q1 Q2 Q3 + $2k as Yes/No checkbox
// Usage: <form data-job-slug="cf-ceo" data-job-title="Co-Founder & CEO - 50% Owner" onsubmit="return submitCareers(event)">
// Put at: js/careers-form.js

async function submitCareers(e) {
  e.preventDefault();
  const form = e.target;
  const jobSlug = form.dataset.jobSlug || form.querySelector('[name="jobSlug"]')?.value || "cf-ceo";
  const jobTitle = form.dataset.jobTitle || form.querySelector('[name="jobTitle"]')?.value || jobSlug;

  const btn = form.querySelector('[type="submit"]') || document.getElementById("careers-submit");
  const status = form.querySelector(".careers-status") || document.getElementById("careers-status");

  const fd = new FormData(form);
  const data = {};
  fd.forEach((v, k) => {
    // trim
    data[k] = (v || "").trim();
  });
  // Map org field to cvLink for backend compatibility
  if (data.org && !data.cvLink) data.cvLink = data.org;
  if (data.cvLink && !data.org) data.org = data.cvLink;

  data.jobSlug = jobSlug;
  data.jobTitle = jobTitle;

  // Validation - required fields from final form
  if (!data.name || !data.email || !data.org) {
    if (status) {
      status.innerHTML = "Please fill required fields: Name, Email, CV Link";
      status.className = "careers-status error";
      status.style.display = "block";
    }
    return false;
  }
  if (!data.q1 || !data.q2 || !data.q3 || !data.investment) {
    if (status) {
      status.innerHTML = "Please answer Q1, Q2, Q3 and $2k Loan – Yes/No required";
      status.className = "careers-status error";
      status.style.display = "block";
    }
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    if (status) {
      status.innerHTML = "Please enter a valid email";
      status.className = "careers-status error";
      status.style.display = "block";
    }
    return false;
  }

  if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
  if (status) { status.textContent = ""; status.className = "careers-status"; status.style.display = "none"; }

  try {
    const res = await fetch("/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.ok) {
      if (status) {
        status.innerHTML = `<strong>Application for ${jobTitle} received!</strong> We will contact within 48h.`;
        status.className = "careers-status success";
        status.style.display = "block";
      }
      form.reset();
      if (btn) {
        btn.textContent = "Sent";
        setTimeout(() => { btn.disabled = false; btn.textContent = `Apply Now - ${jobTitle}`; }, 4000);
      }
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'careers', event_label: jobSlug });
    } else {
      if (status) {
        status.innerHTML = `${json.error || "Failed to send"}<br><small>Contact hr@bdcrops.com</small>`;
        status.className = "careers-status error";
        status.style.display = "block";
      }
      if (btn) { btn.disabled = false; btn.textContent = `Apply Now - ${jobTitle}`; }
    }
  } catch (err) {
    if (status) {
      status.innerHTML = `Network error - Please WhatsApp +880 1717 676441 or email hr@bdcrops.com`;
      status.className = "careers-status error";
      status.style.display = "block";
    }
    if (btn) { btn.disabled = false; btn.textContent = `Apply Now - ${jobTitle}`; }
  }
  return false;
}

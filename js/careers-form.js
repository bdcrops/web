// /js/careers-form.js - ONE JS FOR ALL JOB CIRCULARS - REUSABLE
// Usage: <form data-job-slug="cf-ceo" data-job-title="Co-Founder CEO" onsubmit="return submitCareers(event)">

async function submitCareers(e) {
  e.preventDefault();
  const form = e.target;
  const jobSlug = form.dataset.jobSlug || form.querySelector('[name="jobSlug"]')?.value || "general";
  const jobTitle = form.dataset.jobTitle || form.querySelector('[name="jobTitle"]')?.value || jobSlug;

  const btn = form.querySelector('[type="submit"]') || document.getElementById("careers-submit");
  const status = form.querySelector(".careers-status") || document.getElementById("careers-status") || document.getElementById("cf-ceo-status");

  const fd = new FormData(form);
  const data = {};
  fd.forEach((v, k) => data[k] = (v || "").trim());
  data.jobSlug = jobSlug;
  data.jobTitle = jobTitle;

  // Basic validation
  if (!data.name || !data.email || !data.cvLink) {
    if (status) {
      status.innerHTML = "⚠ Name, Email, CV Link required";
      status.className = "careers-status error";
    }
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    if (status) {
      status.innerHTML = "⚠ Valid email required";
      status.className = "careers-status error";
    }
    return false;
  }

  if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
  if (status) { status.textContent = ""; status.className = "careers-status"; }

  try {
    const res = await fetch("/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.ok) {
      if (status) {
        status.innerHTML = `✅ <strong>Application for ${jobTitle} received!</strong> We will contact in 48h.`;
        status.className = "careers-status success";
      }
      form.reset();
      if (btn) {
        btn.textContent = "Sent ✓";
        setTimeout(() => { btn.disabled = false; btn.textContent = `Apply Now - ${jobTitle}`; }, 5000);
      }
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'careers', event_label: jobSlug });
    } else {
      if (status) {
        status.innerHTML = `⚠ ${json.error || "Failed"}<br><small>hr@bdcrops.com</small>`;
        status.className = "careers-status error";
      }
      if (btn) { btn.disabled = false; btn.textContent = `Apply Now - ${jobTitle}`; }
    }
  } catch (err) {
    if (status) {
      status.innerHTML = `⚠ Network error - WhatsApp +880 1717 676441`;
      status.className = "careers-status error";
    }
    if (btn) { btn.disabled = false; btn.textContent = `Apply Now - ${jobTitle}`; }
  }
  return false;
}

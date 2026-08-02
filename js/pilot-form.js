async function submitPilot(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById("pilot-submit");
    const status = document.getElementById("pilot-status");

    // Collect + validate
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
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        status.innerHTML = "⚠ Please enter a valid email address.";
        status.className = "pilot-status error";
        return false;
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
        }
    } catch (err) {
        console.error("Pilot form error:", err);
        status.innerHTML = `⚠ Network error — please try WhatsApp: <a href="https://wa.me/8801717676441" style="color:inherit;text-decoration:underline;">+880 1717 676441</a>`;
        status.className = "pilot-status error";
        btn.disabled = false;
        btn.textContent = "Send Pilot Request";
    }
    return false;
}

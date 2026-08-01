// Pilot form AJAX submit handler
async function submitPilot(e) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById("pilot-submit");
    const status = document.getElementById("pilot-status");

    // Collect form data
    const data = Object.fromEntries(new FormData(form).entries());

    // UI: loading state
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

        if (json.ok) {
            status.textContent = "✅ Thanks! We'll respond within 24 hours via email & WhatsApp.";
            status.className = "pilot-status success";
            form.reset();
            btn.textContent = "Sent ✓";
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = "Send Pilot Request";
            }, 4000);
        } else {
            throw new Error(json.error || "Submission failed");
        }
    } catch (err) {
        status.textContent = "⚠ " + err.message + " — please try WhatsApp: +880 1717 676441";
        status.className = "pilot-status error";
        btn.disabled = false;
        btn.textContent = "Send Pilot Request";
    }
    return false;
}

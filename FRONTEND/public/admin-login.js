function showToast(message, type = "success") {
    const toastEl = document.getElementById("loginToast");
    const toastBody = toastEl.querySelector(".toast-body");
    toastEl.classList.remove("toast-success", "toast-error", "toast-warning");
    // Apply type-based color
    if (type === "success") toastEl.classList.add("toast-success");
    if (type === "error") toastEl.classList.add("toast-error");
    if (type === "warning") toastEl.classList.add("toast-warning");

    toastBody.innerText = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

document.getElementById("adminForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const geid = document.getElementById("geid").value.trim();
    const password = document.getElementById("adminPass").value.trim();

    if (!geid || !password) {
        showToast("⚠️ Please enter both GEID and Password", "warning");
        return;
    }

    const payload = {
        adminId: geid,
        password: password
    };

    try {
        const res = await fetch("http://localhost:8080/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.text();

        if (data === "INVALID_ADMIN") {
            showToast(" Invalid GEID or Password", "error");
            return;
        }

        // SUCCESS LOGIN
        showToast(" Admin Login Successful", "success");

        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = "admin-dashboard.html";
        }, 1000);

    } catch (err) {
        console.error("Login failed:", err);
        showToast("⚠️ Server error. Backend not running....", "error");
    }
});
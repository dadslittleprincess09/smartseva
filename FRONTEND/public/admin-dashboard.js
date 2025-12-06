const REQUIRED_ADMIN_ID = "GEID-IND-EDU-2025-000123-7";

// Ensure code runs after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadAdminNavbar();
    setupAdminLogout();

    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
        statusFilter.addEventListener("change", filterComplaints);
    }
});

// Load admin info and navbar
async function loadAdminNavbar() {
    try {
        const res = await fetch("http://localhost:8080/api/admin/current");
        const admin = await res.json();
        console.log("Admin fetched:", admin);

        const adminMenu = document.getElementById("navAdminLoggedIn");
        if (admin && admin.adminId === REQUIRED_ADMIN_ID) {
            if (adminMenu) adminMenu.classList.remove("d-none");
            const nameEl = document.getElementById("navAdminName");
            const avatarEl = document.getElementById("navAdminAvatar");
            if (nameEl) nameEl.innerText = "ADMIN";
            if (avatarEl) avatarEl.innerText = "A";

            loadAllComplaints();
        } else {
            console.warn("Admin ID does not match. Redirecting...");
            window.location.href = "adminlogin.html";
        }
    } catch (err) {
        console.error("Error fetching admin:", err);
        window.location.href = "adminlogin.html";
    }
}


async function loadAllComplaints() {
    try {
        const res = await fetch("http://localhost:8080/api/complaints/all");
        const complaints = await res.json();
        console.log("complaints",complaints);
        // Count totals (always full list)
        const resolved = complaints.filter(c => c.status === "RESOLVED").length;
        const sent = complaints.filter(c => c.status === "SEND TO DEPT").length;

        document.getElementById("statApproved").innerText = resolved;
        document.getElementById("statSent").innerText = sent;
        document.getElementById("lastSyncLabel").innerText = new Date().toLocaleString();

        renderComplaintsTable(complaints);

    } catch (err) {
        console.error(err);
    }
}



function renderComplaintsTable(complaints) {
    const tbody = document.getElementById("complaintsBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    complaints.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.userId}</td>
            <td>${c.userName}</td>
            <td>${c.category}</td>
            <td>${c.location}</td>
                        <td>
                ${c.imageUrl 
                    ? `<img src="http://localhost:8080/uploads/${c.imageUrl}" 
                            alt="Complaint image"
                            style="height:90px;width:200px;object-fit:cover;border-radius:4px;">`
                    : "No image"}
            </td>
            <td>${c.severity}</td>
            <td>${new Date(c.createdAt).toLocaleString()}</td>

            <td class="text-end">
                <select class="form-select form-select-sm w-auto"
                    onchange="updateStatus('${c.id}', this.value)">
                    <option value="PENDING" ${c.status === "PENDING" ? "selected" : ""}>PENDING</option>
                    <option value="SEND TO DEPT" ${c.status === "SEND TO DEPT" ? "selected" : ""}>Sent to Dept</option>
                    <option value="RESOLVED" ${c.status === "RESOLVED" ? "selected" : ""}>Resolved</option>
                </select>
            </td>


        `;
        tbody.appendChild(tr);
    });
}

// Update complaint status
async function updateStatus(id, status) {
    try {
        const res = await fetch(`http://localhost:8080/api/complaints/update-status/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (!res.ok) {
            const data = await res.json();
            alert("Failed to update status: " + (data.message || data.status));
            return;
        }

        // 🔥 If RESOLVED → send email
        if (status === "RESOLVED") {
            await fetch(`http://localhost:8080/api/complaints/send-email/${id}`, {
                method: "POST"
            });
        }

        loadAllComplaints();

    } catch (err) {
        console.error("Error updating status:", err);
        alert("Error updating status. Check console.");
    }
}


// Filter complaints by status
async function filterComplaints(e) {
    const status = e.target.value;
    try {
        const res = await fetch("http://localhost:8080/api/complaints/all");
        if (!res.ok) throw new Error("Failed to fetch complaints");

        let complaints = await res.json();
        if (status !== "all") {
            complaints = complaints.filter(c => c.status === status);
        }
        renderComplaintsTable(complaints);
    } catch (err) {
        console.error("Error filtering complaints:", err);
    }
}

// Logout
function setupAdminLogout() {
    const btn = document.getElementById("btnAdminLogout");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        try {
            await fetch("http://localhost:8080/api/admin/logout", { method: "POST" });
            window.location.href = "adminlogin.html";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    });
}

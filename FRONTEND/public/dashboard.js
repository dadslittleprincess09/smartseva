// =========================
// 1. CHECK USER LOGIN
// =========================
async function loadUserDashboard() {
  try {
    const res = await fetch("http://localhost:8080/api/user/current", {
      credentials: "include"
    });

    if (!res.ok) {
      window.location.href = "./login.html";
      return;
    }

    loadMyComplaints();
  } catch (err) {
    console.error("Login check failed:", err);
  }
}

// =========================
// 2. LOAD USER COMPLAINTS
// =========================
async function loadMyComplaints() {
  try {
    const res = await fetch("http://localhost:8080/api/complaints/my", {
      credentials: "include",
    });

    if (!res.ok) {
      alert("Session expired! Please login again.");
      window.location.href = "./login.html";
      return;
    }

    const list = await res.json();
    console.log("My Complaints:", list);

    updateSummaryCounts(list);
    renderAllComplaints(list);
    renderProgressComplaints(list);
    renderResolvedComplaints(list);

  } catch (err) {
    console.error("Failed fetching user complaints:", err);
  }
}

// =========================
// 3. SUMMARY CARDS
// =========================
function updateSummaryCounts(list) {
  const total = list.length;
  const progress = list.filter(c => c.status.toUpperCase() === "SEND TO DEPT").length;
  const resolved = list.filter(c => c.status.toUpperCase() === "RESOLVED").length;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("progressCount").innerText = progress; // this is now "Send to Department"
  document.getElementById("resolvedCount").innerText = resolved;
}


// =========================
// 4. RENDER ALL COMPLAINTS
// =========================
function renderAllComplaints(list) {
  const tbody = document.getElementById("table-all-body");
  tbody.innerHTML = list.map(rowTemplate).join("");
}

// =========================
// 5. RENDER ONLY SEND_TO_DEPARTMENT
// =========================
function renderProgressComplaints(list) {
  const tbody = document.getElementById("table-progress-body");
  if (!tbody) return;

  // Match exact backend value
  const filtered = list.filter(c => c.status === "SEND TO DEPT");



  tbody.innerHTML = filtered.map(rowTemplate).join("");
}


// =========================
// 6. RENDER ONLY RESOLVED
// =========================
function renderResolvedComplaints(list) {
  const tbody = document.getElementById("table-resolved-body");

  tbody.innerHTML = list
    .filter(c => c.status.toUpperCase() === "RESOLVED")
    .map(c => `
      <tr>
        <td>${c.userId}</td>
        <td>${c.category}</td>
       
        <td>${c.location}</td>
        <td>
        ${c.imageUrl 
          ? `<img src="http://localhost:8080/uploads/${c.imageUrl}" 
                 style="height:90px;width:200px;object-fit:cover;border-radius:6px;">`
          : "No Image"}
      </td>
      <td>${c.severity}</td>
       <td>${new Date(c.createdAt).toLocaleString()}</td>
      
        <td>
          <span class="badge bg-success">${c.status}</span>
        </td>
        
      </tr>
    `).join("");
}

        
// =========================
// 7. ROW TEMPLATE (ALL & send to department TABS)
// =========================
function rowTemplate(c) {
  return `
    <tr>
      <td >${c.userId}</td>
      <td>${c.category}</td>
      <td>${c.location}</td>
      <td>
        ${c.imageUrl 
          ? `<img src="http://localhost:8080/uploads/${c.imageUrl}" 
                 style="height:90px;width:200px;object-fit:cover;border-radius:6px;">`
          : "No Image"}
      </td>
       <td>${c.severity}</td>
      <td>${new Date(c.createdAt).toLocaleString()}</td>
       
      <td>
        <span class="status-pill ${
          c.status === "RESOLVED" ? "status-resolved" :
          c.status === "IN_PROGRESS" ? "status-progress" :
          "status-open"
        }">
          ${c.status}
        </span>
      </td>
      
    </tr>
  `;
}

// =========================
loadUserDashboard();

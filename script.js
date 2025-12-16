console.log("SCRIPT LOADED");

// ===============================
// CONFIG
// ===============================
const API = "https://usafe-staff-portal.onrender.com";

const token = localStorage.getItem("usafe_token");
const robloxId = localStorage.getItem("usafe_roblox_id");
const username = localStorage.getItem("usafe_username");
const displayName = localStorage.getItem("usafe_display_name");

// Redirect if not logged in
if (!token || !robloxId) {
  window.location.href = "login.html";
}

// ===============================
// HEADER UI
// ===============================
function setupHeader() {
  const signedInText = document.getElementById("signedInText");
  if (signedInText) {
    signedInText.textContent = `${displayName} (@${username})`;
  }

  const toggle = document.getElementById("userMenuToggle");
  const menu = document.getElementById("dropdownMenu");

  if (toggle && menu) {
    toggle.onclick = () => {
      menu.classList.toggle("hidden");
    };
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.clear();
      window.location.href = "login.html";
    };
  }
}

setupHeader();

// ===============================
// AVATAR LOADING
// ===============================
async function loadAvatar() {
  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`
    );
    const data = await res.json();
    const url = data?.data?.[0]?.imageUrl;

    const avatarImg = document.getElementById("avatarImg");
    if (avatarImg) avatarImg.src = url || "";
  } catch {
    console.warn("Avatar failed to load");
  }
}

loadAvatar();

// ===============================
// ACCESS CONTROL (STAFF ONLY)
// ===============================
async function enforceAccessControl() {
  if (!window.location.pathname.includes("staff.html")) return;

  try {
    const res = await fetch(`${API}/api/users/${robloxId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const user = await res.json();

    const officerRanks = ["2LT", "1LT", "CPT", "MAJ", "LTC", "COL", "GEN"];

    if (!officerRanks.includes(user.rank)) {
      window.location.href = "dashboard.html";
      return;
    }

    const rankEl = document.getElementById("statusRank");
    if (rankEl) rankEl.textContent = user.rank;

  } catch (err) {
    window.location.href = "dashboard.html";
  }
}

enforceAccessControl();

// ===============================
// STATUS PANEL (STAFF PAGE)
// ===============================
async function loadStatus() {
  if (!window.location.pathname.includes("staff.html")) return;

  try {
    const res = await fetch(`${API}/api/status`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    document.getElementById("statusPersonnel").textContent = data.personnel;
    document.getElementById("statusTrainings").textContent = data.trainings;
    document.getElementById("statusMedals").textContent = data.medals;

  } catch (err) {
    console.warn("Status failed to load");
  }
}

loadStatus();

// ===============================
// CREATE TRAINING
// ===============================
async function createTraining() {
  const type = document.getElementById("trainingType").value;
  const date = document.getElementById("trainingDate").value;
  const host = document.getElementById("trainingHost").value;
  const result = document.getElementById("trainingResult");

  result.textContent = "Creating training...";

  try {
    const res = await fetch(`${API}/api/trainings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ type, date, host })
    });

    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Failed to create training";
      return;
    }

    result.textContent = `Training created (ID: ${data.id})`;

  } catch (err) {
    result.textContent = "Network error";
  }
}

// ===============================
// ADD ATTENDEES
// ===============================
async function addAttendees() {
  const trainingId = document.getElementById("attTrainingId").value;
  const attendees = document.getElementById("attendees").value
    .split(",")
    .map(x => x.trim())
    .filter(x => x);

  const result = document.getElementById("attendeeResult");
  result.textContent = "Adding attendees...";

  try {
    const res = await fetch(`${API}/api/trainings/attendees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ trainingId, attendees })
    });

    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Failed to add attendees";
      return;
    }

    result.textContent = "Attendees added successfully";

  } catch (err) {
    result.textContent = "Network error";
  }
}

// ===============================
// ADJUST POINTS / VALOR
// ===============================
async function adjustPoints() {
  const userId = document.getElementById("pointsUserId").value;
  const points = Number(document.getElementById("pointsDelta").value);
  const valor = Number(document.getElementById("valorDelta").value);

  const result = document.getElementById("pointsResult");
  result.textContent = "Applying changes...";

  try {
    const res = await fetch(`${API}/api/users/adjust`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId, points, valor })
    });

    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Failed to adjust points";
      return;
    }

    result.textContent = "Points updated";

  } catch (err) {
    result.textContent = "Network error";
  }
}

// ===============================
// AWARD MEDAL
// ===============================
async function awardMedal() {
  const medalId = document.getElementById("medalId").value;
  const userId = document.getElementById("medalUserId").value;
  const awardedBy = document.getElementById("medalAwardedBy").value;
  const reason = document.getElementById("medalReason").value;

  const result = document.getElementById("medalResult");
  result.textContent = "Awarding medal...";

  try {
    const res = await fetch(`${API}/api/medals/award`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ medalId, userId, awardedBy, reason })
    });

    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Failed to award medal";
      return;
    }

    result.textContent = "Medal awarded successfully";

  } catch (err) {
    result.textContent = "Network error";
  }
}

// ===============================
// PROMOTE USER
// ===============================
async function promoteUser() {
  const userId = document.getElementById("promoteUserId").value;
  const newRank = document.getElementById("newRank").value;

  const result = document.getElementById("promoteResult");
  result.textContent = "Promoting user...";

  try {
    const res = await fetch(`${API}/api/users/promote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId, newRank })
    });

    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Failed to promote user";
      return;
    }

    result.textContent = "User promoted";

  } catch (err) {
    result.textContent = "Network error";
  }
}

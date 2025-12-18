// =============================
// USAFFE STAFF PANEL FRONTEND
// =============================

// CHANGE THIS to your actual Render backend URL:
const API = "https://usafe-staff-portal.onrender.com";

// Session data
const token = localStorage.getItem("usafe_token");
const robloxId = localStorage.getItem("usafe_roblox_id");
const username = localStorage.getItem("usafe_username");
const displayName = localStorage.getItem("usafe_display_name");

// Expose robloxId for HTML onclick
window.robloxId = robloxId;

// Redirect if not logged in
if (!token || !robloxId) {
  window.location.href = "login.html";
}

// Display user info
const signedInText = document.getElementById("signedInText");
if (signedInText) {
  signedInText.textContent = `${displayName} (@${username})`;
}

// =============================
// LOAD AVATAR (via backend proxy)
// =============================
async function loadAvatar() {
  try {
    const res = await fetch(`${API}/api/avatar/${robloxId}`);
    const data = await res.json();

    const avatarImg = document.getElementById("avatarImg");
    if (avatarImg && data.imageUrl) {
      avatarImg.src = data.imageUrl;
    }
  } catch (err) {
    console.warn("Failed to load avatar:", err);
  }
}

// =============================
// DROPDOWN MENU
// =============================
(function setupUserDropdown() {
  const toggle = document.getElementById("userMenuToggle");
  const menu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
})();

// =============================
// LOAD SELF STATUS
// =============================
async function loadSelfStatus() {
  try {
    const res = await fetch(`${API}/api/users/${robloxId}`);
    const data = await res.json();

    const rankEl = document.getElementById("statusRank");
    if (rankEl) rankEl.textContent = data.rank || "Unassigned";
  } catch (err) {
    console.error("Failed to load self status:", err);
  }
}

// =============================
// LOAD COMMAND STATS
// =============================
async function loadCommandStats() {
  try {
    const res = await fetch(`${API}/api/admin/stats`);
    const data = await res.json();

    document.getElementById("statusPersonnel").textContent = data.active_personnel;
    document.getElementById("statusTrainings").textContent = data.trainings_today;
    document.getElementById("statusMedals").textContent = data.medals_awarded;
  } catch (err) {
    console.warn("Failed to load command stats:", err);
  }
}

// =============================
// CREATE TRAINING
// =============================
async function createTraining() {
  const type = document.getElementById("trainingType").value.trim();
  const date = document.getElementById("trainingDate").value.trim();
  const hostId = document.getElementById("trainingHost").value.trim();
  const resultEl = document.getElementById("trainingResult");

  if (!type || !date || !hostId) {
    resultEl.textContent = "Fill in all fields.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Creating training...";
  resultEl.className = "text-sm mt-2 text-yellow-300";

  try {
    const res = await fetch(`${API}/api/trainings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, date, host_id: hostId })
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to create training.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = `Training created (ID: ${data.training_id})`;
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    resultEl.textContent = "Network error.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// =============================
// ADD ATTENDEES
// =============================
async function addAttendees() {
  const trainingId = document.getElementById("attTrainingId").value.trim();
  const raw = document.getElementById("attendees").value.trim();
  const resultEl = document.getElementById("attendeeResult");

  if (!trainingId || !raw) {
    resultEl.textContent = "Training ID and attendee list required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  const attendees = raw.split(",").map(x => x.trim()).filter(x => x.length > 0);

  resultEl.textContent = "Adding attendees...";
  resultEl.className = "text-sm mt-2 text-yellow-300";

  try {
    const res = await fetch(`${API}/api/trainings/${trainingId}/attendees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendees })
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to add attendees.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = "Attendees added successfully.";
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    resultEl.textContent = "Network error.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// =============================
// ADJUST COMBAT POINTS
// =============================
async function adjustPoints() {
  const userId = document.getElementById("pointsUserId").value.trim();
  const delta = Number(document.getElementById("pointsDelta").value || 0);
  const resultEl = document.getElementById("pointsResult");

  if (!userId) {
    resultEl.textContent = "User ID required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Applying changes...";
  resultEl.className = "text-sm mt-2 text-yellow-300";

  try {
    const res = await fetch(`${API}/api/users/${userId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ combatDelta: delta })
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to adjust combat points.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = "Combat points updated.";
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    resultEl.textContent = "Network error.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// =============================
// AWARD MEDAL
// =============================
async function awardMedal() {
  const medalId = Number(document.getElementById("medalId").value);
  const userId = document.getElementById("medalUserId").value.trim();
  const awardedBy = document.getElementById("medalAwardedBy").value.trim();
  const reason = document.getElementById("medalReason").value.trim();
  const resultEl = document.getElementById("medalResult");

  if (!medalId || !userId || !awardedBy || !reason) {
    resultEl.textContent = "All fields required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Awarding medal...";
  resultEl.className = "text-sm mt-2 text-yellow-300";

  try {
    const res = await fetch(`${API}/api/medals/award`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medal_id: medalId,
        user_roblox_id: userId,
        awarded_by_roblox_id: awardedBy,
        reason
      })
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to award medal.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = "Medal awarded successfully.";
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    resultEl.textContent = "Network error.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// =============================
// PROMOTE USER
// =============================
async function promoteUser() {
  const userId = document.getElementById("promoteUserId").value.trim();
  const newRank = document.getElementById("newRank").value.trim();
  const resultEl = document.getElementById("promoteResult");

  if (!userId || !newRank) {
    resultEl.textContent = "User ID and rank required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Processing promotion...";
  resultEl.className = "text-sm mt-2 text-yellow-300";

  try {
    const res = await fetch(`${API}/api/users/${userId}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newRank })
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to promote user.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = `User promoted to ${newRank}.`;
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    resultEl.textContent = "Network error.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// =============================
// INIT
// =============================
(function init() {
  loadAvatar();
  loadSelfStatus();
  loadCommandStats();
})();

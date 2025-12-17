// =============================
// USAFFE / USAFE STAFF PANEL JS
// =============================

const API = "https://usafe-staff-portal.onrender.com";

// ---- Session & basic setup ----
const token = localStorage.getItem("usafe_token");
const robloxId = localStorage.getItem("usafe_roblox_id");
const username = localStorage.getItem("usafe_username");
const displayName = localStorage.getItem("usafe_display_name");

// expose robloxId for inline onclick in HTML (Roblox profile link)
window.robloxId = robloxId;

if (!token || !robloxId) {
  window.location.href = "login.html";
}

// Header display
const signedInText = document.getElementById("signedInText");
if (signedInText) {
  signedInText.textContent = `${displayName} (@${username})`;
}

// ---- Avatar load ----
async function loadAvatar() {
  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`
    );
    const data = await res.json();
    const url = data?.data?.[0]?.imageUrl;

    const avatarImg = document.getElementById("avatarImg");
    if (avatarImg) avatarImg.src = url || "";
  } catch (err) {
    console.warn("Failed to load avatar", err);
  }
}

// ---- Dropdown menu ----
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

// ---- Command status (top cards) ----

async function loadSelfStatus() {
  try {
    const res = await fetch(`${API}/api/users/${robloxId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load user");

    const rankEl = document.getElementById("statusRank");
    if (rankEl) rankEl.textContent = data.rank || "Unassigned";
  } catch (err) {
    console.error("Failed to load self status", err);
    const rankEl = document.getElementById("statusRank");
    if (rankEl) rankEl.textContent = "Unknown";
  }
}

// This endpoint is a suggestion – adjust to your real stats route
async function loadCommandStats() {
  const personnelEl = document.getElementById("statusPersonnel");
  const trainingsEl = document.getElementById("statusTrainings");
  const medalsEl = document.getElementById("statusMedals");

  try {
    const res = await fetch(`${API}/api/admin/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load stats");

    if (personnelEl) personnelEl.textContent = data.active_personnel ?? "-";
    if (trainingsEl) trainingsEl.textContent = data.trainings_today ?? "-";
    if (medalsEl) medalsEl.textContent = data.medals_awarded ?? "-";
  } catch (err) {
    console.warn("Failed to load command stats (you can wire to your own endpoint)", err);
    if (personnelEl) personnelEl.textContent = "-";
    if (trainingsEl) trainingsEl.textContent = "-";
    if (medalsEl) medalsEl.textContent = "-";
  }
}

// ---- Create Training ----

async function createTraining() {
  const typeEl = document.getElementById("trainingType");
  const dateEl = document.getElementById("trainingDate");
  const hostEl = document.getElementById("trainingHost");
  const resultEl = document.getElementById("trainingResult");

  const type = typeEl.value.trim();
  const date = dateEl.value.trim();
  const hostId = hostEl.value.trim();

  if (!type || !date || !hostId) {
    resultEl.textContent = "Fill in all fields.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Creating training...";
  resultEl.className = "text-sm mt-2 text-vintage-200";

  try {
    const res = await fetch(`${API}/api/trainings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        date,      // ISO local string from input
        host_id: Number(hostId),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to create training.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = `Training created. ID: ${data.training_id || "N/A"}`;
    resultEl.className = "text-sm mt-2 text-green-400";

    // Optional: clear fields
    // dateEl.value = "";
    // hostEl.value = "";

  } catch (err) {
    console.error(err);
    resultEl.textContent = "Network error while creating training.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// ---- Add Attendees ----

async function addAttendees() {
  const idEl = document.getElementById("attTrainingId");
  const attendeesEl = document.getElementById("attendees");
  const resultEl = document.getElementById("attendeeResult");

  const trainingId = idEl.value.trim();
  const raw = attendeesEl.value.trim();

  if (!trainingId || !raw) {
    resultEl.textContent = "Training ID and attendee list required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  const attendees = raw
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .map((x) => Number(x))
    .filter((x) => !Number.isNaN(x));

  if (attendees.length === 0) {
    resultEl.textContent = "No valid user IDs found.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Adding attendees...";
  resultEl.className = "text-sm mt-2 text-vintage-200";

  try {
    const res = await fetch(`${API}/api/trainings/${trainingId}/attendees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ attendees }),
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to add attendees.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = `Attendees added successfully.`;
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    console.error(err);
    resultEl.textContent = "Network error while adding attendees.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// ---- Adjust Points / Valor ----

async function adjustPoints() {
  const userIdEl = document.getElementById("pointsUserId");
  const pointsEl = document.getElementById("pointsDelta");
  const valorEl = document.getElementById("valorDelta");
  const resultEl = document.getElementById("pointsResult");

  const userId = userIdEl.value.trim();
  const pointsDelta = Number(pointsEl.value || 0);
  const valorDelta = Number(valorEl.value || 0);

  if (!userId) {
    resultEl.textContent = "User ID is required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  if (Number.isNaN(pointsDelta) || Number.isNaN(valorDelta)) {
    resultEl.textContent = "Points and Valor must be numbers.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Applying changes...";
  resultEl.className = "text-sm mt-2 text-vintage-200";

  try {
    const res = await fetch(`${API}/api/users/${userId}/adjust`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pointsDelta,
        valorDelta,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      resultEl.textContent = data.error || "Failed to adjust points/valor.";
      resultEl.className = "text-sm mt-2 text-red-400";
      return;
    }

    resultEl.textContent = "Adjustments applied successfully.";
    resultEl.className = "text-sm mt-2 text-green-400";
  } catch (err) {
    console.error(err);
    resultEl.textContent = "Network error while adjusting points/valor.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// ---- Award Medal ----

async function awardMedal() {
  const medalIdEl = document.getElementById("medalId");
  const userIdEl = document.getElementById("medalUserId");
  const awardedByEl = document.getElementById("medalAwardedBy");
  const reasonEl = document.getElementById("medalReason");
  const resultEl = document.getElementById("medalResult");

  const medal_id = Number(medalIdEl.value);
  const user_id = Number(userIdEl.value.trim());
  const awarded_by = Number(awardedByEl.value.trim());
  const reason = reasonEl.value.trim();

  if (!medal_id || !user_id || !awarded_by || !reason) {
    resultEl.textContent = "All fields are required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Awarding medal...";
  resultEl.className = "text-sm mt-2 text-vintage-200";

  try {
    const res = await fetch(`${API}/api/medals/award`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        medal_id,
        user_id,
        awarded_by,
        reason,
      }),
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
    console.error(err);
    resultEl.textContent = "Network error while awarding medal.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// ---- Promote User ----

async function promoteUser() {
  const userIdEl = document.getElementById("promoteUserId");
  const rankEl = document.getElementById("newRank");
  const resultEl = document.getElementById("promoteResult");

  const userId = userIdEl.value.trim();
  const newRank = rankEl.value.trim();

  if (!userId || !newRank) {
    resultEl.textContent = "User ID and new rank are required.";
    resultEl.className = "text-sm mt-2 text-red-400";
    return;
  }

  resultEl.textContent = "Processing promotion...";
  resultEl.className = "text-sm mt-2 text-vintage-200";

  try {
    const res = await fetch(`${API}/api/users/${userId}/promote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newRank }),
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
    console.error(err);
    resultEl.textContent = "Network error while promoting user.";
    resultEl.className = "text-sm mt-2 text-red-400";
  }
}

// ---- Init ----
(function init() {
  loadAvatar();
  loadSelfStatus();
  loadCommandStats();
})();

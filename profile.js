// =============================
// USAFFE PROFILE PAGE SCRIPT
// =============================

// CHANGE THIS to your Render backend URL:
const API = "https://usafe-staff-portal.onrender.com";

// Get session data
const robloxId = localStorage.getItem("usafe_roblox_id");
const username = localStorage.getItem("usafe_username");
const displayName = localStorage.getItem("usafe_display_name");

// Redirect if not logged in
if (!robloxId) {
  window.location.href = "login.html";
}

// =============================
// LOAD AVATAR
// =============================
async function loadAvatar() {
  try {
    const res = await fetch(`${API}/api/avatar/${robloxId}`);
    const data = await res.json();

    const avatarImg = document.getElementById("profileAvatar");
    if (avatarImg && data.imageUrl) {
      avatarImg.src = data.imageUrl;
    }
  } catch (err) {
    console.warn("Failed to load avatar:", err);
  }
}

// =============================
// LOAD PROFILE DATA
// =============================
async function loadProfile() {
  try {
    const res = await fetch(`${API}/api/users/${robloxId}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Profile load error:", data.error);
      return;
    }

    // Basic info
    document.getElementById("profileName").textContent =
      `${data.display_name} (@${data.username})`;

    document.getElementById("profileRank").textContent =
      data.rank || "Unassigned";

    document.getElementById("profileCombatPoints").textContent =
      data.combat_points || 0;

    // Days served
    const created = new Date(data.created_at);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    document.getElementById("profileDaysServed").textContent = diff;

    // =============================
    // MEDALS
    // =============================
    const medalContainer = document.getElementById("profileMedals");
    medalContainer.innerHTML = "";

    if (data.medals.length === 0) {
      medalContainer.innerHTML = `<p class="text-gray-400">No decorations awarded.</p>`;
    } else {
      data.medals.forEach(m => {
        const div = document.createElement("div");
        div.className = "bg-vintage-800 p-3 rounded border border-vintage-600 mb-2";

        div.innerHTML = `
          <p class="font-bold text-vintage-200">${m.medal_name}</p>
          <p class="text-sm text-gray-300">${m.reason}</p>
          <p class="text-xs text-gray-400 mt-1">${new Date(m.date).toLocaleDateString()}</p>
        `;

        medalContainer.appendChild(div);
      });
    }

    // =============================
    // TRAININGS
    // =============================
    const trainingContainer = document.getElementById("profileTrainings");
    trainingContainer.innerHTML = "";

    if (data.trainings.length === 0) {
      trainingContainer.innerHTML = `<p class="text-gray-400">No trainings logged.</p>`;
    } else {
      data.trainings.forEach(t => {
        const div = document.createElement("div");
        div.className = "bg-vintage-800 p-3 rounded border border-vintage-600 mb-2";

        div.innerHTML = `
          <p class="font-bold text-vintage-200">${t.type}</p>
          <p class="text-sm text-gray-300">${new Date(t.date).toLocaleString()}</p>
        `;

        trainingContainer.appendChild(div);
      });
    }

  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

// =============================
// INIT
// =============================
(function init() {
  loadAvatar();
  loadProfile();
})();

// Game items with their correct bin types
const gameItems = [
  { id: 1, name: "Plastic bottle", icon: "🧴", type: "plastic" },
  { id: 2, name: "Newspaper", icon: "📰", type: "paper" },
  { id: 3, name: "Banana peel", icon: "🍌", type: "organic" },
  { id: 4, name: "Glass jar", icon: "🫙", type: "glass" },
  { id: 5, name: "Cardboard box", icon: "📦", type: "paper" },
  { id: 6, name: "Aluminum can", icon: "🥫", type: "metal" },
  { id: 7, name: "Food scraps", icon: "🍽️", type: "organic" },
  { id: 8, name: "Plastic bag", icon: "🛍️", type: "plastic" },
  { id: 9, name: "Apple core", icon: "🍎", type: "organic" },
];

// Current user and game state
let currentUser = null;
let currentScore = 0;
let availableItems = [];
let draggedItemId = null;
let draggedItemType = null;

// Initialize app
function init() {
  loadCurrentUser();
  if (currentUser) {
    showScreen("home");
  } else {
    showScreen("signup");
  }
}

// LocalStorage functions
function getUsers() {
  const users = localStorage.getItem("recyclingUsers");
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem("recyclingUsers", JSON.stringify(users));
}

function loadCurrentUser() {
  const userId = localStorage.getItem("currentUserId");
  if (userId) {
    const users = getUsers();
    currentUser = users.find((u) => u.id === userId);
    if (currentUser) {
      currentScore = currentUser.score;
    }
  }
}

function saveCurrentUser() {
  if (!currentUser) return;

  const users = getUsers();
  const index = users.findIndex((u) => u.id === currentUser.id);

  if (index !== -1) {
    users[index] = currentUser;
  } else {
    users.push(currentUser);
  }

  saveUsers(users);
}

// Registration
function register() {
  const nameInput = document.getElementById("name-input");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Por favor ingresá tu nombre / Please enter your name");
    return;
  }

  currentUser = {
    id: Date.now().toString(),
    name: name,
    score: 0,
  };

  currentScore = 0;
  localStorage.setItem("currentUserId", currentUser.id);
  saveCurrentUser();

  showScreen("home");
}

// Logout
function logout() {
  localStorage.removeItem("currentUserId");
  currentUser = null;
  currentScore = 0;
  document.getElementById("name-input").value = "";
  showScreen("signup");
}

// Screen navigation
function showScreen(screenName) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const header = document.getElementById("header");
  if (screenName === "signup") {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }

  const screen = document.getElementById(`${screenName}-screen`);
  if (screen) {
    screen.classList.add("active");
  }

  if (screenName === "home") {
    updateHomeScreen();
  } else if (screenName === "game") {
    initGame();
  } else if (screenName === "ranking") {
    updateRanking();
  }
}

// Update home screen
function updateHomeScreen() {
  document.getElementById("user-name").textContent = currentUser.name;
  document.getElementById("home-score").textContent = currentScore;
}

// Initialize game
function initGame() {
  availableItems = [...gameItems].sort(() => Math.random() - 0.5);

  document.getElementById("game-score").textContent = currentScore;

  const itemsRemainingEl = document.getElementById("items-remaining");
  if (itemsRemainingEl) {
    itemsRemainingEl.textContent = availableItems.length;
  }

  const feedback = document.getElementById("feedback");
  feedback.textContent = "";
  feedback.className = "feedback";

  renderItems();
  setupBins();
}

// Setup bins with event listeners
function setupBins() {
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.addEventListener("dragover", handleDragOver);
    bin.addEventListener("dragleave", handleDragLeave);
    bin.addEventListener("drop", handleDrop);
  });
  console.log("✅ Bins setup complete");
}

// Render draggable items
function renderItems() {
  const container = document.getElementById("items-container");
  container.innerHTML = "";

  availableItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";
    itemDiv.draggable = true;
    itemDiv.dataset.id = item.id;
    itemDiv.dataset.type = item.type;

    itemDiv.innerHTML = `
      <div class="item-icon">${item.icon}</div>
      <div class="item-label">${item.name}</div>
    `;

    itemDiv.addEventListener("dragstart", handleDragStart);
    itemDiv.addEventListener("dragend", handleDragEnd);

    container.appendChild(itemDiv);
  });
  console.log("✅ Items rendered:", availableItems.length);
}

// Drag handlers
function handleDragStart(e) {
  const item = e.currentTarget;
  draggedItemId = item.dataset.id;
  draggedItemType = item.dataset.type;
  item.classList.add("dragging");
  console.log("🎯 Dragging:", draggedItemId, "Type:", draggedItemType);
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.classList.remove("drag-over");
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

function handleDragLeave(e) {
  const bin = e.currentTarget;
  if (!bin.contains(e.relatedTarget)) {
    bin.classList.remove("drag-over");
  }
}

function handleDrop(e) {
  e.preventDefault();
  const bin = e.currentTarget;
  bin.classList.remove("drag-over");

  const binType = bin.dataset.type;
  const feedback = document.getElementById("feedback");

  console.log("📦 Drop - Item:", draggedItemType, "Bin:", binType);

  if (!draggedItemId || !draggedItemType || !binType) {
    console.error("❌ Missing data");
    return;
  }

  if (draggedItemType === binType) {
    console.log("✅ CORRECT!");

    currentScore += 10;
    currentUser.score = currentScore;
    saveCurrentUser();

    document.getElementById("game-score").textContent = currentScore;

    feedback.textContent = "¡Correcto! / Correct! ✅";
    feedback.className = "feedback correct";

    bin.style.transform = "scale(1.1)";
    setTimeout(() => {
      bin.style.transform = "";
    }, 200);

    availableItems = availableItems.filter(
      (item) => item.id.toString() !== draggedItemId.toString()
    );

    renderItems();

    const itemsRemainingEl = document.getElementById("items-remaining");
    if (itemsRemainingEl) {
      itemsRemainingEl.textContent = availableItems.length;
    }

    if (availableItems.length === 0) {
      setTimeout(() => {
        feedback.textContent =
          "¡Completaste el juego! / You completed the game! 🎉";
        feedback.className = "feedback complete";
        createConfetti();
        setTimeout(() => {
          initGame();
        }, 3000);
      }, 1000);
    }
  } else {
    console.log("❌ INCORRECT!");
    feedback.textContent = "Intentá otra vez / Try again ❌";
    feedback.className = "feedback incorrect";

    bin.style.animation = "shake 0.5s";
    setTimeout(() => {
      bin.style.animation = "";
    }, 500);
  }

  setTimeout(() => {
    if (availableItems.length > 0) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
  }, 2000);

  draggedItemId = null;
  draggedItemType = null;
}

// Update ranking
function updateRanking() {
  const users = getUsers();
  users.sort((a, b) => b.score - a.score);

  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  if (users.length === 0) {
    leaderboard.innerHTML =
      '<p style="text-align: center; color: #4a5568;">No hay usuarios todavía / No users yet</p>';
    return;
  }

  users.forEach((user, index) => {
    const item = document.createElement("div");
    item.className = "leaderboard-item";

    if (index === 0) item.classList.add("top1");
    else if (index === 1) item.classList.add("top2");
    else if (index === 2) item.classList.add("top3");

    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

    item.innerHTML = `
      <span class="leaderboard-rank">${medal || index + 1}</span>
      <span class="leaderboard-name">${user.name}</span>
      <span class="leaderboard-score">${user.score}</span>
    `;

    leaderboard.appendChild(item);
  });
}

// Confetti effect
function createConfetti() {
  const colors = ["#48bb78", "#38a169", "#fbbf24", "#f59e0b", "#3b82f6"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }
}

// Hide loader when app is ready
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.classList.add("hidden");
    }
  }, 1500);
});

// Start app
init();

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
  // Hide all screens
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Show header except on signup
  const header = document.getElementById("header");
  if (screenName === "signup") {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }

  // Show selected screen
  const screen = document.getElementById(`${screenName}-screen`);
  if (screen) {
    screen.classList.add("active");
  }

  // Update screen content
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
  // Shuffle items
  availableItems = [...gameItems].sort(() => Math.random() - 0.5);

  // Update score display
  document.getElementById("game-score").textContent = currentScore;

  // Clear feedback
  const feedback = document.getElementById("feedback");
  feedback.textContent = "";
  feedback.className = "feedback";

  // Render items
  renderItems();
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

    itemDiv.addEventListener("dragstart", dragStart);
    itemDiv.addEventListener("dragend", dragEnd);

    container.appendChild(itemDiv);
  });
}

// Drag and drop functions
function dragStart(e) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
  e.dataTransfer.setData("itemType", e.target.dataset.type);
  e.target.classList.add("dragging");
}

function dragEnd(e) {
  e.target.classList.remove("dragging");
}

function allowDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

function drop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  const itemId = e.dataTransfer.getData("text/plain");
  const itemType = e.dataTransfer.getData("itemType");
  const binType = e.currentTarget.dataset.type;

  const feedback = document.getElementById("feedback");

  if (itemType === binType) {
    // Correct!
    currentScore += 10;
    currentUser.score = currentScore;
    saveCurrentUser();

    document.getElementById("game-score").textContent = currentScore;

    feedback.textContent = "¡Correcto! / Correct! ✅";
    feedback.className = "feedback correct";

    // Remove item from available items
    availableItems = availableItems.filter(
      (item) => item.id.toString() !== itemId
    );
    renderItems();

    // Check if game is complete
    if (availableItems.length === 0) {
      setTimeout(() => {
        feedback.textContent =
          "¡Completaste el juego! / You completed the game! 🎉";
        setTimeout(() => {
          initGame();
        }, 2000);
      }, 1000);
    }
  } else {
    // Incorrect
    feedback.textContent = "Intentá otra vez / Try again ❌";
    feedback.className = "feedback incorrect";
  }

  // Clear feedback after 2 seconds
  setTimeout(() => {
    if (availableItems.length > 0) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
  }, 2000);
}

// Remove drag-over class when leaving
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.addEventListener("dragleave", (e) => {
      e.currentTarget.classList.remove("drag-over");
    });
  });
});

// Update ranking
function updateRanking() {
  const users = getUsers();
  users.sort((a, b) => b.score - a.score);

  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  if (users.length === 0) {
    leaderboard.innerHTML =
      '<p style="text-align: center; color: #718096;">No hay usuarios todavía / No users yet</p>';
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

// Start app
init();

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

  // Update items remaining
  const itemsRemainingEl = document.getElementById("items-remaining");
  if (itemsRemainingEl) {
    itemsRemainingEl.textContent = availableItems.length;
  }

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
    itemDiv.setAttribute("data-id", item.id);
    itemDiv.setAttribute("data-type", item.type);

    itemDiv.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-label">${item.name}</div>
        `;

    itemDiv.addEventListener("dragstart", dragStart);
    itemDiv.addEventListener("dragend", dragEnd);

    container.appendChild(itemDiv);

    console.log(
      "Rendered item:",
      item.name,
      "ID:",
      item.id,
      "Type:",
      item.type
    ); // Debug
  });
}

// Drag and drop functions
function dragStart(e) {
  // Find the item element (in case we're dragging from a child)
  const item = e.target.closest(".item");
  if (!item) return;

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", item.dataset.id);
  e.dataTransfer.setData("itemType", item.dataset.type);
  item.classList.add("dragging");

  console.log("Dragging item:", item.dataset.id, "Type:", item.dataset.type); // Debug
}

function dragEnd(e) {
  // Find the item element (in case we're dragging from a child)
  const item = e.target.closest(".item");
  if (item) {
    item.classList.remove("dragging");
  }
  // Remove drag-over from all bins
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.classList.remove("drag-over");
  });
}

function allowDrop(e) {
  e.preventDefault();
  // Find the bin element (in case we're hovering over a child)
  const bin = e.target.closest(".bin");
  if (bin) {
    bin.classList.add("drag-over");
  }
}

function drop(e) {
  e.preventDefault();
  e.stopPropagation();

  // Find the bin element (in case we dropped on a child element)
  const bin = e.target.closest(".bin");
  if (!bin) {
    console.log("No bin found!");
    return;
  }

  bin.classList.remove("drag-over");

  const itemId = e.dataTransfer.getData("text/plain");
  const itemType = e.dataTransfer.getData("itemType");
  const binType = bin.getAttribute("data-type");

  const feedback = document.getElementById("feedback");

  console.log("=== DROP DEBUG ===");
  console.log("Item ID:", itemId);
  console.log("Item Type:", itemType);
  console.log("Bin Type:", binType);
  console.log("Match:", itemType === binType);
  console.log("================");

  // Validate data
  if (!itemId || !itemType || !binType) {
    console.error("Missing data:", { itemId, itemType, binType });
    return;
  }

  if (itemType === binType) {
    // Correct!
    currentScore += 10;
    currentUser.score = currentScore;
    saveCurrentUser();

    document.getElementById("game-score").textContent = currentScore;

    feedback.textContent = "¡Correcto! / Correct! ✅";
    feedback.className = "feedback correct";

    // Play success sound effect (visual feedback)
    bin.style.transform = "scale(1.1)";
    setTimeout(() => {
      bin.style.transform = "";
    }, 200);

    // Remove item from available items
    availableItems = availableItems.filter(
      (item) => item.id.toString() !== itemId
    );
    renderItems();

    // Update items remaining
    const itemsRemainingEl = document.getElementById("items-remaining");
    if (itemsRemainingEl) {
      itemsRemainingEl.textContent = availableItems.length;
    }

    // Check if game is complete
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
    // Incorrect
    feedback.textContent = "Intentá otra vez / Try again ❌";
    feedback.className = "feedback incorrect";

    // Shake animation for incorrect
    bin.style.animation = "shake 0.5s";
    setTimeout(() => {
      bin.style.animation = "";
    }, 500);
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
      // Only remove if we're actually leaving the bin (not just moving to a child)
      if (!bin.contains(e.relatedTarget)) {
        bin.classList.remove("drag-over");
      }
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
  }, 1500); // Show loader for at least 1.5 seconds
});

// Start app
init();

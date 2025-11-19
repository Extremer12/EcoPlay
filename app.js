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
let supabase = null;

// Initialize app
async function init() {
  // Initialize Supabase
  if (window.initSupabase) {
    window.initSupabase();
    supabase = window.supabase.createClient(
      "https://okciuqlwsbrdyshybbqb.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2l1cWx3c2JyZHlzaHliYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNDI4NzAsImV4cCI6MjA0NzYxODg3MH0.8xYvqZQvXqYvXqYvXqYvXqYvXqYvXqYvXqYvXqYvXqY"
    );
  }

  await checkSession();
}

// Check if user is logged in
async function checkSession() {
  if (!supabase) {
    showScreen("login");
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await loadUserData(session.user);
    showScreen("home");
  } else {
    showScreen("login");
  }
}

// Load user data from Supabase
async function loadUserData(user) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (data) {
    currentUser = {
      id: data.id,
      auth_id: data.auth_id,
      name: data.name,
      email: user.email,
      score: data.score || 0,
    };
    currentScore = data.score || 0;
    console.log("✅ User loaded:", currentUser);
  } else {
    // Create user profile if doesn't exist
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          auth_id: user.id,
          name: user.email.split("@")[0],
          email: user.email,
          score: 0,
        },
      ])
      .select()
      .single();

    if (newUser) {
      currentUser = {
        id: newUser.id,
        auth_id: newUser.auth_id,
        name: newUser.name,
        email: newUser.email,
        score: 0,
      };
      currentScore = 0;
    }
  }
}

// Show/Hide screens
function showLogin() {
  showScreen("login");
}

function showSignup() {
  showScreen("signup");
}

// Handle Login
async function handleLogin() {
  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value;

  if (!email || !password) {
    alert("Por favor completá todos los campos / Please fill all fields");
    return;
  }

  if (!supabase) {
    alert("Error: Supabase no está inicializado");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    await loadUserData(data.user);
    showScreen("home");

    // Clear inputs
    document.getElementById("email-input").value = "";
    document.getElementById("password-input").value = "";
  } catch (error) {
    console.error("Login error:", error);
    alert("Error al iniciar sesión: " + error.message);
  }
}

// Handle Signup
async function handleSignup() {
  const name = document.getElementById("signup-name-input").value.trim();
  const email = document.getElementById("signup-email-input").value.trim();
  const password = document.getElementById("signup-password-input").value;

  if (!name || !email || !password) {
    alert("Por favor completá todos los campos / Please fill all fields");
    return;
  }

  if (password.length < 6) {
    alert(
      "La contraseña debe tener al menos 6 caracteres / Password must be at least 6 characters"
    );
    return;
  }

  if (!supabase) {
    alert("Error: Supabase no está inicializado");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) throw error;

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert([
      {
        auth_id: data.user.id,
        name: name,
        email: email,
        score: 0,
      },
    ]);

    if (profileError) throw profileError;

    alert(
      "¡Cuenta creada! Por favor iniciá sesión / Account created! Please login"
    );
    showScreen("login");

    // Clear inputs
    document.getElementById("signup-name-input").value = "";
    document.getElementById("signup-email-input").value = "";
    document.getElementById("signup-password-input").value = "";
  } catch (error) {
    console.error("Signup error:", error);
    alert("Error al crear cuenta: " + error.message);
  }
}

// Logout
async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  currentUser = null;
  currentScore = 0;
  showScreen("login");
}

// Save score to Supabase
async function saveScore() {
  if (!currentUser || !supabase) return;

  const { error } = await supabase
    .from("users")
    .update({ score: currentScore })
    .eq("id", currentUser.id);

  if (error) {
    console.error("Error saving score:", error);
  } else {
    console.log("✅ Score saved:", currentScore);
  }
}

// Screen navigation
function showScreen(screenName) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const header = document.getElementById("header");
  if (screenName === "login" || screenName === "signup") {
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
}

// Drag handlers
function handleDragStart(e) {
  const item = e.currentTarget;
  draggedItemId = item.dataset.id;
  draggedItemType = item.dataset.type;
  item.classList.add("dragging");
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

async function handleDrop(e) {
  e.preventDefault();
  const bin = e.currentTarget;
  bin.classList.remove("drag-over");

  const binType = bin.dataset.type;
  const feedback = document.getElementById("feedback");

  if (!draggedItemId || !draggedItemType || !binType) {
    return;
  }

  if (draggedItemType === binType) {
    currentScore += 10;
    await saveScore();

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

// Update ranking from Supabase
async function updateRanking() {
  if (!supabase) {
    document.getElementById("leaderboard").innerHTML =
      '<p style="text-align: center; color: #4a5568;">Error: No se pudo conectar a la base de datos</p>';
    return;
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("score", { ascending: false })
    .limit(20);

  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  if (error || !users || users.length === 0) {
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

    // Highlight current user
    if (currentUser && user.id === currentUser.id) {
      item.style.border = "3px solid #48bb78";
      item.style.fontWeight = "900";
    }

    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

    item.innerHTML = `
      <span class="leaderboard-rank">${medal || index + 1}</span>
      <span class="leaderboard-name">${user.name}</span>
      <span class="leaderboard-score">${user.score || 0}</span>
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

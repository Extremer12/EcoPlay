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
let useSupabase = false;
let gameStartTime = null;
let gameTimer = null;
let elapsedTime = 0;

// Initialize app
async function init() {
  console.log("🚀 Initializing app...");

  // Try to initialize Supabase
  try {
    if (typeof window.supabase !== "undefined") {
      const SUPABASE_URL = "https://okciuqlwsbrdyshybbqb.supabase.co";
      // IMPORTANTE: Reemplaza esta key con tu key real de Supabase
      const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2l1cWx3c2JyZHlzaHliYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MDY3MzgsImV4cCI6MjA3OTA4MjczOH0.fJbVO22iixTIJWwnFVW_WKFbAreRCU6573CgM0feJG8";

      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

      // Test connection
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      if (!error) {
        useSupabase = true;
        console.log("✅ Supabase connected");
        await checkSession();
      } else {
        throw error;
      }
    } else {
      throw new Error("Supabase library not loaded");
    }
  } catch (error) {
    console.warn(
      "⚠️ Supabase not available, using localStorage:",
      error.message
    );
    useSupabase = false;
    loadLocalUser();
  } finally {
    // Hide loader after initialization
    hideLoader();
  }
}

// Check if user is logged in (Supabase)
async function checkSession() {
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

// Load user from localStorage (fallback)
function loadLocalUser() {
  const userId = localStorage.getItem("currentUserId");
  if (userId) {
    const users = getLocalUsers();
    currentUser = users.find((u) => u.id === userId);
    if (currentUser) {
      currentScore = currentUser.score || 0;
      showScreen("home");
      return;
    }
  }
  showScreen("login");
}

// LocalStorage functions
function getLocalUsers() {
  const users = localStorage.getItem("recyclingUsers");
  return users ? JSON.parse(users) : [];
}

function saveLocalUsers(users) {
  localStorage.setItem("recyclingUsers", JSON.stringify(users));
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
      avgTime: data.avg_time || 0,
    };
    currentScore = data.score || 0;
    console.log("✅ User loaded:", currentUser);
  } else {
    // Create user profile
    const { data: newUser } = await supabase
      .from("users")
      .insert([
        {
          auth_id: user.id,
          name: user.email.split("@")[0],
          email: user.email,
          score: 0,
          avg_time: 0,
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
        avgTime: 0,
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

  if (useSupabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      await loadUserData(data.user);
      showScreen("home");

      document.getElementById("email-input").value = "";
      document.getElementById("password-input").value = "";
    } catch (error) {
      console.error("Login error:", error);
      alert("Error al iniciar sesión: " + error.message);
    }
  } else {
    // Fallback: localStorage login
    const users = getLocalUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      currentUser = user;
      currentScore = user.score || 0;
      localStorage.setItem("currentUserId", user.id);
      showScreen("home");
      document.getElementById("email-input").value = "";
      document.getElementById("password-input").value = "";
    } else {
      alert("Email o contraseña incorrectos / Incorrect email or password");
    }
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

  if (useSupabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      await supabase.from("users").insert([
        {
          auth_id: data.user.id,
          name: name,
          email: email,
          score: 0,
          avg_time: 0,
        },
      ]);

      alert(
        "¡Cuenta creada! Por favor iniciá sesión / Account created! Please login"
      );
      showScreen("login");

      document.getElementById("signup-name-input").value = "";
      document.getElementById("signup-email-input").value = "";
      document.getElementById("signup-password-input").value = "";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Error al crear cuenta: " + error.message);
    }
  } else {
    // Fallback: localStorage signup
    const users = getLocalUsers();

    if (users.find((u) => u.email === email)) {
      alert("Este email ya está registrado / This email is already registered");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      password: password,
      score: 0,
      avgTime: 0,
    };

    users.push(newUser);
    saveLocalUsers(users);

    alert(
      "¡Cuenta creada! Por favor iniciá sesión / Account created! Please login"
    );
    showScreen("login");

    document.getElementById("signup-name-input").value = "";
    document.getElementById("signup-email-input").value = "";
    document.getElementById("signup-password-input").value = "";
  }
}

// Logout
async function logout() {
  if (useSupabase && supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem("currentUserId");
  }
  currentUser = null;
  currentScore = 0;
  showScreen("login");
}

// Save score
async function saveScore(timeInSeconds) {
  if (!currentUser) return;

  // Calculate new average time
  const gamesPlayed = Math.floor(currentScore / 90); // 9 items * 10 points
  const newAvgTime =
    gamesPlayed > 0
      ? ((currentUser.avgTime || 0) * gamesPlayed + timeInSeconds) /
        (gamesPlayed + 1)
      : timeInSeconds;

  if (useSupabase) {
    const { error } = await supabase
      .from("users")
      .update({
        score: currentScore,
        avg_time: Math.round(newAvgTime),
      })
      .eq("id", currentUser.id);

    if (!error) {
      currentUser.avgTime = Math.round(newAvgTime);
      console.log(
        "✅ Score saved:",
        currentScore,
        "Avg time:",
        Math.round(newAvgTime)
      );
    }
  } else {
    const users = getLocalUsers();
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index !== -1) {
      users[index].score = currentScore;
      users[index].avgTime = Math.round(newAvgTime);
      saveLocalUsers(users);
      currentUser.avgTime = Math.round(newAvgTime);
    }
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

  // Start timer
  gameStartTime = Date.now();
  elapsedTime = 0;
  startTimer();

  renderItems();
  setupBins();
}

// Timer functions
function startTimer() {
  if (gameTimer) clearInterval(gameTimer);

  gameTimer = setInterval(() => {
    elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    updateTimerDisplay();
  }, 100);
}

function stopTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function updateTimerDisplay() {
  const timerEl = document.getElementById("game-timer");
  if (timerEl) {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// Setup bins
function setupBins() {
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.addEventListener("dragover", handleDragOver);
    bin.addEventListener("dragleave", handleDragLeave);
    bin.addEventListener("drop", handleDrop);
  });
}

// Render items
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

  if (!draggedItemId || !draggedItemType || !binType) return;

  if (draggedItemType === binType) {
    currentScore += 10;

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
      stopTimer();
      await saveScore(elapsedTime);

      setTimeout(() => {
        feedback.textContent = `¡Completaste el juego en ${elapsedTime}s! / You completed the game in ${elapsedTime}s! 🎉`;
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

// Update ranking
async function updateRanking() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  let users = [];

  if (useSupabase) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("score", { ascending: false })
      .order("avg_time", { ascending: true })
      .limit(20);

    if (!error && data) {
      users = data;
    }
  } else {
    users = getLocalUsers()
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.avgTime || 999999) - (b.avgTime || 999999);
      })
      .slice(0, 20);
  }

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

    if (currentUser && user.id === currentUser.id) {
      item.style.border = "3px solid #48bb78";
      item.style.fontWeight = "900";
    }

    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
    const avgTime = user.avg_time || user.avgTime || 0;
    const timeDisplay = avgTime > 0 ? `⏱️ ${avgTime}s` : "";

    item.innerHTML = `
      <span class="leaderboard-rank">${medal || index + 1}</span>
      <span class="leaderboard-name">${user.name}</span>
      <span class="leaderboard-stats">
        <span class="leaderboard-score">${user.score || 0}</span>
        <span class="leaderboard-time">${timeDisplay}</span>
      </span>
    `;

    leaderboard.appendChild(item);
  });
}

// Confetti
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

// Hide loader function
function hideLoader() {
  setTimeout(() => {
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.classList.add("hidden");
    }
  }, 500);
}

// Start app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

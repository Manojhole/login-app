const API = "http://vegz.online/api";

// Toggle UI
function showRegister() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
  document.getElementById("registerBox").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
}

// Register
async function register() {
  const username = document.getElementById("regUser").value;
  const password = document.getElementById("regPass").value;

  const res = await fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  document.getElementById("msg").innerText = data.message;

  // after register go to login
  showLogin();
}

// Login
async function login() {
  const username = document.getElementById("logUser").value;
  const password = document.getElementById("logPass").value;

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.status === 200) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("welcome").style.display = "block";
    document.getElementById("welcomeText").innerText = "Welcome, " + username;
  } else {
    const text = await res.text();
    document.getElementById("msg").innerText = text;
  }
}

// Logout
function logout() {
  document.getElementById("welcome").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
}

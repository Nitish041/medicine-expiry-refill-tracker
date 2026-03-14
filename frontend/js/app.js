// =============================
//  Shared Frontend App Script
// =============================

// Base API URL
const API_BASE = "http://localhost:3000/api";

// -----------------------------
//  USER SESSION HANDLING
// -----------------------------
function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem("mt_user")) || { username: "admin" };
  } catch (e) {
    return { username: "admin" };
  }
}

function logoutAndRedirect() {
  localStorage.removeItem("mt_user");
  location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const u = getLoggedUser();
  const navUser = document.getElementById("navUser");
  if (navUser) navUser.textContent = u.username ? "Hi, " + u.username : "";
});

// -----------------------------
//  UNIVERSAL MESSAGE DISPLAY
// -----------------------------
function showMsg(el, type, text) {
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
  setTimeout(() => {
    el.innerHTML = "";
  }, 4000);
}

// -----------------------------
//  FETCH HELPERS
// -----------------------------
async function apiGet(path) {
  const r = await fetch(API_BASE + path);
  return r.json();
}

async function apiPost(path, body) {
  const r = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

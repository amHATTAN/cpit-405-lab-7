const ACCESS_KEY = "maGciS17Xx5Fw9vg8r_3NopB5I_8BSXevSTsdrPU0vk";
const API_URL = "https://api.unsplash.com/search/photos";

// DOM Elements
const elements = {
  input: document.getElementById("q"),
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
  loader: document.getElementById("loader"),
  btns: {
    xhr: document.getElementById("btn-xhr"),
    fetch: document.getElementById("btn-fetch"),
    async: document.getElementById("btn-async"),
  }
};

// Event Listeners
elements.btns.xhr.addEventListener("click", searchXHR);
elements.btns.fetch.addEventListener("click", searchFetchPromises);
elements.btns.async.addEventListener("click", searchFetchAsync);
elements.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchFetchAsync();
});

// Helper: Toggle UI State
function setUIState(state, message = "") {
  elements.status.textContent = message;
  
  if (state === "loading") {
    elements.loader.classList.remove("hidden");
    elements.grid.style.opacity = "0.5";
  } else {
    elements.loader.classList.add("hidden");
    elements.grid.style.opacity = "1";
  }
}

// Helper: Build API URL
function buildUrl() {
  const query = encodeURIComponent(elements.input.value.trim() || "Technology");
  return `${API_URL}?query=${query}&per_page=12&orientation=portrait`;
}

// Core: Render Photos with Staggered Animation
function renderPhotos(results) {
  elements.grid.innerHTML = "";
  
  if (!results || results.length === 0) {
    elements.grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">No images found.</p>`;
    return;
  }

  results.forEach((photo, index) => {
    const card = document.createElement("div");
    card.className = "card";
    // Stagger animation delay based on index (50ms increments)
    card.style.animationDelay = `${index * 50}ms`;

    const img = document.createElement("img");
    img.src = photo.urls.small; // Use 'small' for better performance
    img.alt = photo.alt_description || "Unsplash Photo";
    img.loading = "lazy"; // Native lazy loading

    // Optional: Add a link to the original
    const link = document.createElement("a");
    link.href = photo.links.html;
    link.target = "_blank";
    link.appendChild(img);

    card.appendChild(link);
    elements.grid.appendChild(card);
  });
}

// --- Method 1: XHR ---
function searchXHR() {
  setUIState("loading", "Searching via XHR...");

  const xhr = new XMLHttpRequest();
  xhr.open("GET", buildUrl());
  xhr.setRequestHeader("Authorization", `Client-ID ${ACCESS_KEY}`);

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      renderPhotos(data.results);
      setUIState("idle", `Found ${data.results.length} results (XHR).`);
    } else {
      setUIState("idle", `Error ${xhr.status}: ${xhr.statusText}`);
    }
  };

  xhr.onerror = () => setUIState("idle", "Network Error (XHR).");
  xhr.send();
}

// --- Method 2: Fetch (Promises) ---
function searchFetchPromises() {
  setUIState("loading", "Searching via Fetch (Promises)...");

  fetch(buildUrl(), {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` }
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      renderPhotos(data.results);
      setUIState("idle", `Found ${data.results.length} results (Fetch).`);
    })
    .catch(err => {
      setUIState("idle", `Error: ${err.message}`);
    });
}

// --- Method 3: Fetch (Async/Await) ---
async function searchFetchAsync() {
  try {
    setUIState("loading", "Searching via Async/Await...");

    const res = await fetch(buildUrl(), {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    renderPhotos(data.results);
    setUIState("idle", `Found ${data.results.length} results (Async).`);
  } catch (err) {
    setUIState("idle", `Error: ${err.message}`);
  }
}

// Init: Trigger an initial search so the page isn't empty
window.addEventListener('DOMContentLoaded', () => {
    searchFetchAsync();
});
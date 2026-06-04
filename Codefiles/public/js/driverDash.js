let map;
let truckMarker;
let restockMarkers = [];

// Check session on load — redirect to login if not authenticated
async function checkSession() {
  try {
    const response = await fetch("/drivers/dashboard");

    if (!response.ok) {
      window.location.href = "/driver";
      return;
    }

    const data = await response.json();

    if (!data.success || !data.driver) {
      window.location.href = "/driver";
      return;
    }

    populateDashboard(data.driver);

  } catch (error) {
    console.error("Session check error:", error);
    window.location.href = "/driver";
  }
}

function populateDashboard(driver) {
  // Header
  document.getElementById("headerDriverName").textContent = driver.driverName;
  document.getElementById("headerTruckName").textContent  = driver.truckName;
  document.getElementById("headerStatus").textContent     = driver.isActive ? "🟢 Active" : "🔴 Inactive";
  document.getElementById("headerFood").textContent       = "🍱 " + driver.foodStock;
  document.getElementById("headerWater").textContent      = "💧 " + driver.waterStock;

  // Info panel
  document.getElementById("driverName").textContent    = "Welcome, " + driver.driverName;
  document.getElementById("truckName").textContent     = "Truck: " + driver.truckName;
  document.getElementById("truckLocation").textContent = "Location: " + driver.locationName;
  document.getElementById("truckStatus").textContent   = "Active: " + (driver.isActive ? "Yes" : "No");

  // Stock form
  document.getElementById("foodStock").value  = driver.foodStock;
  document.getElementById("waterStock").value = driver.waterStock;

  initialiseMap(driver);
  loadRestockLocations();
}

function initialiseMap(driver) {
  const lat = Number(driver.latitude);
  const lng = Number(driver.longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return;

  if (!map) {
    map = L.map("map").setView([lat, lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(map);
  } else {
    map.setView([lat, lng], 14);
  }

  if (truckMarker) map.removeLayer(truckMarker);

  truckMarker = L.marker([lat, lng]).addTo(map).bindPopup(`
    <strong>${driver.truckName}</strong><br>
    ${driver.locationName}<br>
    Food: ${driver.foodStock} · Water: ${driver.waterStock}<br>
    Active: ${driver.isActive ? "Yes" : "No"}
  `);

  setTimeout(() => map.invalidateSize(), 100);
}

// Stock update
document.getElementById("stockForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const msg = document.getElementById("stockMessage");
  msg.textContent = "";

  const foodStock  = Number(document.getElementById("foodStock").value);
  const waterStock = Number(document.getElementById("waterStock").value);

  if (isNaN(foodStock) || isNaN(waterStock) || foodStock < 0 || waterStock < 0) {
    msg.textContent = "Stock values must be valid non-negative numbers";
    return;
  }

  try {
    const response = await fetch("/drivers/update-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodStock, waterStock })
    });

    const data = await response.json();
    msg.textContent = data.message || (response.ok ? "Updated" : "Update failed");

    if (data.truck) {
      document.getElementById("foodStock").value  = data.truck.food_stock;
      document.getElementById("waterStock").value = data.truck.water_stock;
      document.getElementById("headerFood").textContent  = "🍱 " + data.truck.food_stock;
      document.getElementById("headerWater").textContent = "💧 " + data.truck.water_stock;
    }
  } catch (error) {
    document.getElementById("stockMessage").textContent = "Could not update stock";
  }
});

// Truck status
document.getElementById("setActiveButton").addEventListener("click",   () => updateStatus(true));
document.getElementById("setInactiveButton").addEventListener("click", () => updateStatus(false));

async function updateStatus(isActive) {
  const msg = document.getElementById("statusMessage");
  msg.textContent = "";

  try {
    const response = await fetch("/drivers/set-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive })
    });

    const data = await response.json();
    msg.textContent = data.message || (response.ok ? "Updated" : "Update failed");

    if (data.truck) {
      document.getElementById("truckStatus").textContent  = "Active: " + (data.truck.is_active ? "Yes" : "No");
      document.getElementById("headerStatus").textContent = data.truck.is_active ? "🟢 Active" : "🔴 Inactive";
    }
  } catch (error) {
    document.getElementById("statusMessage").textContent = "Could not update status";
  }
}

// Restock locations
async function loadRestockLocations() {
  const list = document.getElementById("restockList");

  try {
    const response = await fetch("/drivers/restock-locations");

    if (!response.ok) {
      list.innerHTML = "<li>Could not load restock locations</li>";
      return;
    }

    const data = await response.json();
    const locations = data.restockLocations || [];

    restockMarkers.forEach(m => map && map.removeLayer(m));
    restockMarkers = [];
    list.innerHTML = "";

    if (locations.length === 0) {
      list.innerHTML = "<li>No restock locations available</li>";
      return;
    }

    locations.forEach(loc => {
      const li = document.createElement("li");
      li.textContent = `${loc.name} — ${loc.address} · ${loc.food_available ? "Food ✓" : "No food"} · ${loc.water_available ? "Water ✓" : "No water"}`;
      list.appendChild(li);

      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (!isNaN(lat) && !isNaN(lng) && map) {
        const marker = L.marker([lat, lng]).addTo(map).bindPopup(`
          <strong>${loc.name}</strong><br>${loc.address}
        `);
        restockMarkers.push(marker);
      }
    });
  } catch (error) {
    list.innerHTML = "<li>Could not load restock locations</li>";
  }
}

// Logout
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    const response = await fetch("/drivers/logout", { method: "POST" });
    if (response.ok) window.location.href = "/driver";
  } catch (error) {
    console.error("Logout error:", error);
  }
});

checkSession();

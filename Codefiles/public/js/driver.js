const loginModal = document.getElementById("loginModal");
const driverDashboard = document.getElementById("driverDashboard");

const driverLoginForm = document.getElementById("driverLoginForm");
const loginMessage = document.getElementById("loginMessage");

const driverName = document.getElementById("driverName");
const truckName = document.getElementById("truckName");
const truckLocation = document.getElementById("truckLocation");
const truckStatus = document.getElementById("truckStatus");

const stockForm = document.getElementById("stockForm");
const foodStock = document.getElementById("foodStock");
const waterStock = document.getElementById("waterStock");
const stockMessage = document.getElementById("stockMessage");

const setActiveButton = document.getElementById("setActiveButton");
const setInactiveButton = document.getElementById("setInactiveButton");
const statusMessage = document.getElementById("statusMessage");

const restockList = document.getElementById("restockList");
const logoutButton = document.getElementById("logoutButton");

let map;
let truckMarker;
let restockMarkers = [];

async function checkDriverSession() {
  try {
    const response = await fetch("/drivers/dashboard");

    if (!response.ok) {
      showLoginModal();
      return;
    }

    const data = await response.json();

    if (!data.success || !data.driver) {
      showLoginModal();
      return;
    }

    showDashboard(data.driver);
  } catch (error) {
    console.error("Session check error:", error);
    showLoginModal();
  }
}

function showLoginModal() {
  loginModal.style.display = "block";
  driverDashboard.style.display = "none";
}

function showDashboard(driver) {
  loginModal.style.display = "none";
  driverDashboard.style.display = "block";

  driverName.textContent = `Welcome, ${driver.driverName}`;
  truckName.textContent = `Truck: ${driver.truckName}`;
  truckLocation.textContent = `Location: ${driver.locationName}`;
  truckStatus.textContent = `Active: ${driver.isActive ? "Yes" : "No"}`;

  foodStock.value = driver.foodStock;
  waterStock.value = driver.waterStock;

  initialiseMap(driver);
  loadRestockLocations();
}

function initialiseMap(driver) {
  const truckLat = Number(driver.latitude);
  const truckLng = Number(driver.longitude);

  if (Number.isNaN(truckLat) || Number.isNaN(truckLng)) {
    console.error("Invalid truck coordinates");
    return;
  }

  if (!map) {
    map = L.map("map").setView([truckLat, truckLng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
  } else {
    map.setView([truckLat, truckLng], 14);
  }

  if (truckMarker) {
    map.removeLayer(truckMarker);
  }

  truckMarker = L.marker([truckLat, truckLng])
    .addTo(map)
    .bindPopup(`
      <strong>${driver.truckName}</strong><br>
      ${driver.locationName}<br>
      Food stock: ${driver.foodStock}<br>
      Water stock: ${driver.waterStock}<br>
      Active: ${driver.isActive ? "Yes" : "No"}
    `);

  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

driverLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";

  const loginData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch("/drivers/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    showDashboard(data.driver);
  } catch (error) {
    console.error("Login error:", error);
    loginMessage.textContent = "Could not connect to server";
  }
});

stockForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  stockMessage.textContent = "";

  const updatedFoodStock = Number(foodStock.value);
  const updatedWaterStock = Number(waterStock.value);

  if (
    Number.isNaN(updatedFoodStock) ||
    Number.isNaN(updatedWaterStock) ||
    updatedFoodStock < 0 ||
    updatedWaterStock < 0
  ) {
    stockMessage.textContent = "Stock values must be valid non-negative numbers";
    return;
  }

  try {
    const response = await fetch("/drivers/update-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        foodStock: updatedFoodStock,
        waterStock: updatedWaterStock
      })
    });

    const data = await response.json();

    if (!response.ok) {
      stockMessage.textContent = data.message || "Stock update failed";
      return;
    }

    stockMessage.textContent = data.message;

    if (data.truck) {
      foodStock.value = data.truck.food_stock;
      waterStock.value = data.truck.water_stock;
    }
  } catch (error) {
    console.error("Stock update error:", error);
    stockMessage.textContent = "Could not update stock";
  }
});

setActiveButton.addEventListener("click", async () => {
  await updateTruckStatus(true);
});

setInactiveButton.addEventListener("click", async () => {
  await updateTruckStatus(false);
});

async function updateTruckStatus(isActive) {
  statusMessage.textContent = "";

  try {
    const response = await fetch("/drivers/set-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        isActive: isActive
      })
    });

    const data = await response.json();

    if (!response.ok) {
      statusMessage.textContent = data.message || "Status update failed";
      return;
    }

    statusMessage.textContent = data.message;
    truckStatus.textContent = `Active: ${data.truck.is_active ? "Yes" : "No"}`;
  } catch (error) {
    console.error("Status update error:", error);
    statusMessage.textContent = "Could not update truck status";
  }
}

async function loadRestockLocations() {
  try {
    const response = await fetch("/drivers/restock-locations");

    if (!response.ok) {
      restockList.innerHTML = "<li>Could not load restock locations</li>";
      return;
    }

    const data = await response.json();
    const locations = data.restockLocations || [];

    restockList.innerHTML = "";

    if (map) {
      restockMarkers.forEach((marker) => {
        map.removeLayer(marker);
      });
    }

    restockMarkers = [];

    if (locations.length === 0) {
      restockList.innerHTML = "<li>No restock locations available</li>";
      return;
    }

    locations.forEach((location) => {
      const listItem = document.createElement("li");

      const foodText = location.food_available ? "Food available" : "No food";
      const waterText = location.water_available ? "Water available" : "No water";

      listItem.textContent = `${location.name} - ${location.address} (${foodText}, ${waterText})`;
      restockList.appendChild(listItem);

      const lat = Number(location.latitude);
      const lng = Number(location.longitude);

      if (!Number.isNaN(lat) && !Number.isNaN(lng) && map) {
        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`
            <strong>${location.name}</strong><br>
            ${location.address}<br>
            ${foodText}<br>
            ${waterText}
          `);

        restockMarkers.push(marker);
      }
    });
  } catch (error) {
    console.error("Restock location fetch error:", error);
    restockList.innerHTML = "<li>Could not load restock locations</li>";
  }
}

// Logout
logoutButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/drivers/logout", {
      method: "POST"
    });

    if (response.ok) {
      showLoginModal();
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
});

checkDriverSession();
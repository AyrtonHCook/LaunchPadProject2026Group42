function toRadians(x) {
  result = (x * Math.PI) / 180;
  return result;
}

// loaction1 and loaction2 are [latitude, longitude]
function getDistance(lat1, lon1, lat2, lon2) {
  ((radius = 3), 959); // in miles
  latDif = toRadians(lat2 - lat1);
  lonDif = toRadians(lon2 - lon1);
  const a =
    Math.sin(latDif / 2) * Math.sin(latDif / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(lonDif / 2) *
      Math.sin(lonDif / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

// heatwave active at 30 or above
function updateTemp(value) {
  tempPill = document.getElementsByClassName("temp-pill")[0];
  alertBlock = document.getElementsByClassName("alert alert--critical");
  if (value >= 30) {
    if (!tempPill.classList.contains("temp-pill--alert")) {
      tempPill.classList.add("temp-pill--alert");
    }
    alertBlock.display = "block";
    tempPill.textContent = `${value}°C &mdash; Heatwave Active`;
  } else {
    if (tempPill.classList.contains("temp-pill--alert")) {
      tempPill.classList.remove("temp-pill--alert");
    }
    alertBlock.display = "none";
    tempPill.textContent = `${value}°C`;
  }
}

// values is array
function updateStatCard(values) {
  statCards = document.getElementsByClassName("stat-card__value");
  statCards[0].textContent = values[0];
  statCards[1].textContent = `${values[1]} mi`;
  statCards[2].textContent = values[2];
}

function generateStockCards(userLat, userLon, trucks) {
  truckList = document.getElementsByClassName("truck-list")[0];
  trucks.forEach((truck) => {
    if (truck.is_active) {
      if (truck.food_stock <= 10 || truck.water_stock <= 10) {
        truckStatus = "status--low";
      }
      truckStatus = "status--active";
    } else if (!truck.is_active) {
      truckStatus = "status--offline";
    }
    truckLocation = truck.location_name;
    distance = getDistance(
      userLat,
      userLon,
      Number(truck.latitude),
      Number(truck.longitude),
    );
    if (truck.food_stock <= 10) {
      foodStatus = "pill--warn";
      foodText = "Food running low";
    } else {
      foodStatus = "pill--food";
      foodText = "Food";
    }
    if (truck.water_stock <= 10) {
      waterStatus = "pill--warn";
      waterText = "Water running low";
    } else {
      waterStatus = "pill--water";
      waterText = "Water";
    }
    if (!truck.is_active) {
      foodStatus = "";
      waterStatus = "";
    }
    const truckCard = document.createElement("li");
    truckCard.classList.add("truck-item");
    truckCard.innerHTML = `
            <span class="status ${truckStatus}"></span>
		    <div class="truck-item__info">
		        <strong>${truckLocation}</strong>
		        <span class="truck-item__location">${distance.toFixed(1)} miles away</span>
		    </div>
		    <div class="truck-item__stock">
			    <span class="pill ${foodStatus}">${foodText}</span>
			    <span class="pill ${waterStatus}">${waterText}</span>
		    </div>
        `;
    truckList.appendChild(truckCard);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    fetch("./userDash")
      .then((res) => res.json())
      .then((data) => {
        // user location is fixed for the prototype
        userLat = 52.480389570853774;
        userLon = -1.9217520450213872;
        result = data.body;
        console.log(result);
        temp = result.currentTemp;
        updateTemp(temp);
        truckNum = result.trucks.length;
        // get distance of between user and each active truck and total water stock
        distances = [];
        waterSum = 0;
        trucks = result.trucks;
        trucks.forEach((element) => {
          if (element.is_active) {
            console.log("coords:", {
              userLat,
              userLon,
              truckLat: Number(element.latitude),
              truckLon: Number(element.longitude),
            });
            distance = getDistance(
              userLat,
              userLon,
              Number(element.latitude),
              Number(element.longitude),
            );
            distances.push(distance);
            waterSum += element.water_stock;
          }
        });
        // get number of active trucks
        truckNum = distances.length;
        // get the distance of the nearest truck
        console.log(distances);
        closest = Math.min(...distances);
        // if water is available
        waterAvailable = false;
        if (waterSum > 0) {
          waterAvailable = true;
        }
        console.log([truckNum, closest, waterAvailable]);
        updateStatCard([truckNum, closest.toFixed(1), waterAvailable]);
        generateStockCards(userLat, userLon, trucks);
      });
  } catch (error) {
    console.error(error);
  }
});

const popupData = {
  heat: {
    title: "Heat-related illness",
    content: `
      <p><strong>Recognise the signs of heat exhaustion:</strong></p>
      <ul>
        <li>Heavy sweating and cold, pale, clammy skin</li>
        <li>Fast, weak pulse</li>
        <li>Nausea or vomiting</li>
        <li>Muscle cramps, tiredness, weakness</li>
        <li>Dizziness or fainting</li>
      </ul>
      <p><strong>What to do:</strong></p>
      <ul>
        <li>Move to a cool place</li>
        <li>Loosen clothing and apply cool, wet cloths</li>
        <li>Sip water slowly</li>
        <li>If symptoms worsen or last more than 1 hour, call 999</li>
      </ul>
      <p><strong>Heat stroke is a medical emergency.</strong> If someone has hot, red skin, a rapid pulse, or loses consciousness, call 999 immediately.</p>
    `,
  },
  cooling: {
    title: "Cooling centres open",
    content: `
      <p><strong>Open today as cool spaces:</strong></p>
      <ul>
        <li><strong>Ladywood Library</strong> — 9am to 6pm</li>
        <li><strong>Summerfield Park Pavilion</strong> — 10am to 5pm</li>
      </ul>
      <p>These locations offer air conditioning, seating, and free water. No appointment needed — just walk in.</p>
      <p><strong>What to bring:</strong></p>
      <ul>
        <li>Any medications you need</li>
        <li>A water bottle (refills available)</li>
        <li>ID if you have it (not required)</li>
      </ul>
      <p>Cooling centres are especially recommended for elderly residents, those with health conditions, and families with young children.</p>
    `,
  },
  trucks: {
    title: "Truck operating hours",
    content: `
      <p><strong>Mobile support trucks are active 8am to 8pm</strong> during the heatwave alert.</p>
      <p>Services provided:</p>
      <ul>
        <li>Free bottled water distribution</li>
        <li>Sunscreen and cooling towels</li>
        <li>Basic first aid for heat-related issues</li>
        <li>Information about nearby cooling centres</li>
      </ul>
      <p><strong>Truck locations today:</strong></p>
      <ul>
        <li>City Centre — Victoria Square</li>
        <li>Ladywood — Icknield Port Road</li>
        <li>Summerfield Park — Main entrance</li>
      </ul>
      <p>Trucks rotate between locations. Follow @BhamAlerts on social media for live updates.</p>
    `,
  },
};

const overlay = document.getElementById("popupOverlay");
const popupTitle = document.getElementById("popupTitle");
const popupContent = document.getElementById("popupContent");
const closeBtn = document.getElementById("popupClose");

// Open popup on card click
document.querySelectorAll(".info-card").forEach((card) => {
  card.addEventListener("click", () => {
    const topic = card.dataset.topic;
    const data = popupData[topic];

    if (data) {
      popupTitle.textContent = data.title;
      popupContent.innerHTML = data.content;
      overlay.classList.add("active");
    }
  });
});

// Close popup
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.remove("active");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    overlay.classList.remove("active");
  }
});

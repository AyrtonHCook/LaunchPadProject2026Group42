function toRadians(x){
    result = x * Math.PI / 180;
    return result;
}

// loaction1 and loaction2 are [latitude, longitude]
function getDistance(lat1, lon1, lat2, lon2){
    radius =  3,959 // in miles
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
function updateTemp(value){
    tempPill = document.getElementsByClassName("temp-pill")[0];
    alertBlock = document.getElementsByClassName("alert alert--critical");
    if(value >= 30){
        if (!tempPill.classList.contains("temp-pill--alert")){
            tempPill.classList.add("temp-pill--alert");
        }
        alertBlock.display = "block"
        tempPill.textContent = `${value}°C &mdash; Heatwave Active`;
    }
    else{
        if (tempPill.classList.contains("temp-pill--alert")){
            tempPill.classList.remove("temp-pill--alert");
        }
        alertBlock.display = "none"
        tempPill.textContent = `${value}°C`;
    }
}

// values is array
function updateStatCard(values){
    statCards = document.getElementsByClassName("stat-card__value");
    statCards[0].textContent = values[0];
    statCards[1].textContent = `${values[1]} mi`;
    statCards[2].textContent = values[2];
}

function generateStockCards(userLat, userLon, trucks){
    truckList = document.getElementsByClassName("truck-list")[0];
    trucks.forEach(truck => {
        if(truck.is_active){
            if(truck.food_stock <= 10 || truck.water_stock <= 10){
                truckStatus = "status--low";
            }
            truckStatus = "status--active";
        }
        else if(!truck.is_active){
            truckStatus = "status--offline";
        }
        truckLocation = truck.location_name;
        distance = getDistance(userLat, userLon, Number(truck.latitude), Number(truck.longitude));
        if(truck.food_stock <= 10){
            foodStatus = "pill--warn";
            foodText = "Food running low";
        }
        else{
            foodStatus = "pill--food";
            foodText = "Food";
        }
        if(truck.water_stock <= 10){
            waterStatus = "pill--warn";
            waterText = "Water running low";
        }
        else{
            waterStatus = "pill--water";
            waterText = "Water"
        }
        if(!truck.is_active){
            foodStatus = "";
            waterStatus = "";
        }
        const  truckCard = document.createElement("li");
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
        `
        truckList.appendChild(truckCard);
    })
}



document.addEventListener("DOMContentLoaded", () => {
    try{
        fetch("./userDash")
        .then(res => res.json())
        .then(data =>{
            // user location is fixed for the prototype
            userLat = 52.480389570853774;
            userLon = -1.9217520450213872;
            result = data.body;
            console.log(result);
            temp = result.currentTemp;
            updateTemp(temp);
            truckNum = result.trucks.length;
            // get distance of between user and each active truck and total water stock
            distances = []
            waterSum = 0
            trucks = result.trucks;
            trucks.forEach(element => {
                if(element.is_active){
                    console.log("coords:", {
                        userLat,
                        userLon,
                        truckLat: Number(element.latitude),
                        truckLon: Number(element.longitude)
                    });
                    distance = getDistance(userLat, userLon, Number(element.latitude), Number(element.longitude));
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
            if(waterSum > 0){
                waterAvailable = true;
            }
            console.log([truckNum, closest, waterAvailable])
            updateStatCard([truckNum, closest.toFixed(1), waterAvailable]);
            generateStockCards(userLat, userLon, trucks);

            
        })
    }
    catch(error){
        console.error(error);
    }
    
})

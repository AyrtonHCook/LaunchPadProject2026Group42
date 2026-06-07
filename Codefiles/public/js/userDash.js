// heatwave active at 30 or above
function updateTemp(value){
    tempPill = document.getElementsByClassName("temp-pill");
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


document.addEventListener("DOMContentLoaded", () => {
    fetch("./userDash")
})

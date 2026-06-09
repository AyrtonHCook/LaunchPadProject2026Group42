const express = require("express");
const router = express.Router();

const pool = require("../db");
async function getTemp(){
    const apiKey = "bfa64163226c4f04ab8104959260806"; // insert key here
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Birmingham&aqi=no`;
    try{
        res = await fetch(url);
        if(!res.ok){
            return -999;
        }
        const data = await  res.json();
        const temp = data.current.temp_c;
        return temp;
    }
    catch(error){
        console.error(error);
        return -999;
    }
}

router.get("/userDash", async (req, res) => {
  try {
    const temp = await getTemp();
    console.log(temp);
    const results = await pool.query(`SELECT * FROM trucks`);

    if (temp == -1) {
      return res.json({
        success: false,
        message: "failed",
        body: {
          currentTemp: -1,
          trucks: results.rows,
        },
      });
    }
    res.json({
      success: true,
      message: "success",
      body: {
        currentTemp: temp,
        trucks: results.rows,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "server error",
      body: {
        currentTemp: -1,
        trucks: [],
      },
    });
  }
});

router.get("/userDashboard", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        d.driver_id,
        d.full_name,
        d.email,
        d.role,
        t.truck_id,
        t.truck_name,
        t.location_name,
        t.latitude,
        t.longitude,
        t.is_active,
        t.food_stock,
        t.water_stock
      FROM drivers d
      JOIN trucks t ON d.assigned_truck_id = t.truck_id
      WHERE d.driver_id = $1
      AND t.truck_id = $2
      `,
      [req.session.driverId, req.session.truckId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver or truck not found",
      });
    }

    const driver = result.rows[0];

    return res.json({
      success: true,
      driver: {
        driverId: driver.driver_id,
        driverName: driver.full_name,
        email: driver.email,
        role: driver.role,
        truckId: driver.truck_id,
        truckName: driver.truck_name,
        locationName: driver.location_name,
        latitude: driver.latitude,
        longitude: driver.longitude,
        isActive: driver.is_active,
        foodStock: driver.food_stock,
        waterStock: driver.water_stock,
      },
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error loading dashboard",
    });
  }
});
router.get("/userDashboardd", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT t.truck_id,t.latitude,t.longitude
    FROM trucks t 
    WHERE truck_id = 1
      `,
      // [req.session.driverId, req.session.truckId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver or truck not found",
      });
    }

    const driver = result.rows[0];

    return res.json({
      success: true,
      driver: {
        driverId: driver.driver_id,
        driverName: driver.full_name,
        email: driver.email,
        role: driver.role,
        truckId: driver.truck_id,
        truckName: driver.truck_name,
        locationName: driver.location_name,
        latitude: driver.latitude,
        longitude: driver.longitude,
        isActive: driver.is_active,
        foodStock: driver.food_stock,
        waterStock: driver.water_stock,
      },
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error loading dashboard",
    });
  }
});

module.exports = router;

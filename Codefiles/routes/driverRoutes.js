const express = require("express");
const router = express.Router();

const pool = require("../db");

//only loggedin users can submit requests
function requireDriverLogin(req, res, next) {
  if (!req.session) {
    return res.status(500).json({
      success: false,
      message: "Session is not configured on the server"
    });
  }

  if (!req.session.driverId || !req.session.truckId) {
    return res.status(401).json({
      success: false,
      message: "Driver not logged in"
    });
  }

  next();
}

router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Full name, email and password are required"
    });
  }

  if (password.length < 4) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 4 characters"
    });
  }

  try {
    const existingDriver = await pool.query(
      `
      SELECT driver_id
      FROM drivers
      WHERE email = $1
      `,
      [email]
    );

    if (existingDriver.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A driver with this email already exists"
      });
    }

    // all new drivers use truck 1 for testing
    // proper version needs admin truck assignment
    const result = await pool.query(
      `
      INSERT INTO drivers (
        full_name,
        email,
        password,
        assigned_truck_id,
        role
      )
      VALUES ($1, $2, $3, 1, 'driver')   
      RETURNING
        driver_id,
        full_name,
        email,
        assigned_truck_id,
        role
      `,
      [fullName, email, password]
    );

    return res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      driver: result.rows[0]
    });
  } catch (error) {
    console.error("Driver register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }


    // passwords are plain text
    // proper version should hash passwords
  try {
    const result = await pool.query(
      `
      SELECT 
        d.driver_id,
        d.full_name,
        d.email,
        d.password,
        d.assigned_truck_id,
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
      WHERE d.email = $1
      AND d.password = $2
      `,
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const driver = result.rows[0];

    req.session.driverId = driver.driver_id;
    req.session.truckId = driver.truck_id;

    return res.json({
      success: true,
      message: "Login successful",
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
        waterStock: driver.water_stock
      }
    });
  } catch (error) {
    console.error("Driver login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

router.get("/dashboard", requireDriverLogin, async (req, res) => {
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
      [req.session.driverId, req.session.truckId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver or truck not found"
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
        waterStock: driver.water_stock
      }
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error loading dashboard"
    });
  }
});

//update stock for trucks
router.post("/update-stock", requireDriverLogin, async (req, res) => {
  const { foodStock, waterStock } = req.body;

  if (foodStock === undefined || waterStock === undefined) {
    return res.status(400).json({
      success: false,
      message: "Food stock and water stock are required"
    });
  }

  const parsedFoodStock = Number(foodStock);
  const parsedWaterStock = Number(waterStock);

  if (Number.isNaN(parsedFoodStock) || Number.isNaN(parsedWaterStock)) {
    return res.status(400).json({
      success: false,
      message: "Stock values must be numbers"
    });
  }

  if (!Number.isInteger(parsedFoodStock) || !Number.isInteger(parsedWaterStock)) {
    return res.status(400).json({
      success: false,
      message: "Stock values must be whole numbers"
    });
  }

  if (parsedFoodStock < 0 || parsedWaterStock < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock values cannot be negative"
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE trucks
      SET 
        food_stock = $1,
        water_stock = $2
      WHERE truck_id = $3
      RETURNING 
        truck_id,
        truck_name,
        location_name,
        latitude,
        longitude,
        is_active,
        food_stock,
        water_stock
      `,
      [parsedFoodStock, parsedWaterStock, req.session.truckId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Truck not found. Stock was not updated"
      });
    }

    return res.json({
      success: true,
      message: "Stock updated",
      truck: result.rows[0]
    });
  } catch (error) {
    console.error("Stock update error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error updating stock"
    });
  }
});

//set truck status
router.post("/set-status", requireDriverLogin, async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isActive must be true or false"
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE trucks
      SET is_active = $1
      WHERE truck_id = $2
      RETURNING 
        truck_id,
        truck_name,
        location_name,
        latitude,
        longitude,
        is_active,
        food_stock,
        water_stock
      `,
      [isActive, req.session.truckId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Truck not found. Status was not updated"
      });
    }

    return res.json({
      success: true,
      message: `Truck set to ${isActive ? "active" : "inactive"}`,
      truck: result.rows[0]
    });
  } catch (error) {
    console.error("Status update error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error updating status"
    });
  }
});

//find restock locations
router.get("/restock-locations", requireDriverLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        restock_id,
        name,
        address,
        latitude,
        longitude,
        food_available,
        water_available
      FROM restock_locations
      ORDER BY name
      `
    );

    return res.json({
      success: true,
      restockLocations: result.rows
    });
  } catch (error) {
    console.error("Restock location fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error loading restock locations"
    });
  }
});

//logout
router.post("/logout", requireDriverLogin, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");

    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
});

// Pending resident requests for driver map:

router.get("/requests", requireDriverLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        request_id,
        user_name,
        message,
        latitude,
        longitude,
        status,
        created_at
      FROM requests
      WHERE status = 'Pending'
      ORDER BY created_at DESC
      `
    );

    return res.json({
      success: true,
      requests: result.rows
    });
  } catch (error) {
    console.error ("Error on requests fetch:", error);

    return res.status(500).json({
      success: false,
      message: "Server error loading requests"
    });

  }
}); 

router.get("/trucks", requireDriverLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        truck_id,
        truck_name,
        location_name,
        latitude,
        longitude,
        food_stock,
        water_stock,
        is_active
      FROM trucks
      ORDER BY truck_id
      `
    );

    res.json({
      success: true,
      trucks: result.rows
    });
  } catch (error) {
    console.error("Fetching trucks error:", error);

    res.status(500).json({
      success: false,
      message: "Server error loading trucks!"
    });
  }
});

router.post("/requests/:id/accept", requireDriverLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE requests
      SET
        status = 'Accepted',
        assigned_driver_id = $1,
        assigned_truck_id = $2
      WHERE request_id = $3
      AND status = 'Pending'
      RETURNING request_id, status, assigned_driver_id, assigned_truck_id 
      `,
      [req.session.driverId, req.session.truckId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or has already been accepted!"
      });
    }

    res.json({
      success: true,
      message: "Request accepted",
      request: result.rows[0]
    });

  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error accepting request!"
    });
  }
});



module.exports = router;
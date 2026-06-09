jest.mock("../db", () => ({
  query: jest.fn()
}));

const request = require("supertest");
const pool = require("../db");
const app = require("../app");

function mockDriverLoginResult() {
  return {
    rows: [
      {
        driver_id: 1,
        full_name: "Test Driver",
        email: "driver@example.com",
        password: "password123",
        assigned_truck_id: 2,
        role: "driver",
        truck_id: 2,
        truck_name: "Truck 2",
        location_name: "Summerfield Park",
        latitude: "52.486100",
        longitude: "-1.930200",
        is_active: false,
        food_stock: 25,
        water_stock: 60
      }
    ]
  };
}

describe("driverRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("logs in driver with correct details", async () => {
    pool.query.mockResolvedValue(mockDriverLoginResult());

    const response = await request(app)
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "password123"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.driver.driverName).toBe("Test Driver");
    expect(response.body.driver.truckId).toBe(2);
  });

  test("rejects invalid login details", async () => {
    pool.query.mockResolvedValue({
      rows: []
    });

    const response = await request(app)
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "wrongpassword"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("rejects dashboard access when not logged in", async () => {
    const response = await request(app).get("/drivers/dashboard");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("returns dashboard when logged in", async () => {
    const agent = request.agent(app);

    pool.query
      .mockResolvedValueOnce(mockDriverLoginResult())
      .mockResolvedValueOnce({
        rows: [
          {
            driver_id: 1,
            full_name: "Test Driver",
            email: "driver@example.com",
            role: "driver",
            truck_id: 2,
            truck_name: "Truck 2",
            location_name: "Summerfield Park",
            latitude: "52.486100",
            longitude: "-1.930200",
            is_active: false,
            food_stock: 25,
            water_stock: 60
          }
        ]
      });

    await agent
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "password123"
      });

    const response = await agent.get("/drivers/dashboard");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.driver.truckName).toBe("Truck 2");
  });

  test("rejects invalid stock values", async () => {
    const agent = request.agent(app);

    pool.query.mockResolvedValueOnce(mockDriverLoginResult());

    await agent
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "password123"
      });

    const response = await agent
      .post("/drivers/update-stock")
      .send({
        foodStock: -1,
        waterStock: 20
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("updates stock when logged in", async () => {
    const agent = request.agent(app);

    pool.query
      .mockResolvedValueOnce(mockDriverLoginResult())
      .mockResolvedValueOnce({
        rows: [
          {
            truck_id: 2,
            truck_name: "Truck 2",
            location_name: "Summerfield Park",
            latitude: "52.486100",
            longitude: "-1.930200",
            is_active: false,
            food_stock: 80,
            water_stock: 90
          }
        ]
      });

    await agent
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "password123"
      });

    const response = await agent
      .post("/drivers/update-stock")
      .send({
        foodStock: 80,
        waterStock: 90
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.truck.food_stock).toBe(80);
    expect(response.body.truck.water_stock).toBe(90);
  });

  test("updates truck status when logged in", async () => {
    const agent = request.agent(app);

    pool.query
      .mockResolvedValueOnce(mockDriverLoginResult())
      .mockResolvedValueOnce({
        rows: [
          {
            truck_id: 2,
            truck_name: "Truck 2",
            location_name: "Summerfield Park",
            latitude: "52.486100",
            longitude: "-1.930200",
            is_active: true,
            food_stock: 25,
            water_stock: 60
          }
        ]
      });

    await agent
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "password123"
      });

    const response = await agent
      .post("/drivers/set-status")
      .send({
        isActive: true
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.truck.is_active).toBe(true);
  });

  test("logs out driver when logged in", async () => {
    const agent = request.agent(app);

    pool.query.mockResolvedValueOnce(mockDriverLoginResult());

    await agent
      .post("/drivers/login")
      .send({
        email: "driver@example.com",
        password: "password123"
      });

    const response = await agent.post("/drivers/logout");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
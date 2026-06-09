jest.mock("../db", () => ({
  query: jest.fn()
}));

const request = require("supertest");
const pool = require("../db");
const app = require("../app");

describe("GET /userDash", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns user dashboard truck data", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          truck_id: 1,
          truck_name: "Truck 1",
          location_name: "Ladywood Community Centre",
          latitude: "52.481200",
          longitude: "-1.923000",
          food_stock: 50,
          water_stock: 100,
          is_active: true
        }
      ]
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temp_c: 30
        }
      })
    });

    const response = await request(app).get("/userDash");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.body.currentTemp).toBe(30);
    expect(response.body.body.trucks).toHaveLength(1);
    expect(response.body.body.trucks[0].truck_name).toBe("Truck 1");
  });

  test("returns failed response if weather API fails", async () => {
    pool.query.mockResolvedValue({
      rows: []
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false
    });

    const response = await request(app).get("/userDash");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.body.currentTemp).toBe(-1);
    expect(response.body.body.trucks).toEqual([]);
  });

  test("returns server error if database fails", async () => {
    pool.query.mockRejectedValue(new Error("database failed"));

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temp_c: 30
        }
      })
    });

    const response = await request(app).get("/userDash");

    expect(response.statusCode).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.body.trucks).toEqual([]);
  });
});
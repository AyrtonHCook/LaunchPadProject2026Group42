DROP TABLE IF EXISTS restock_locations;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS trucks;
DROP TABLE IF EXISTS requests;

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

CREATE TABLE trucks (
    truck_id SERIAL PRIMARY KEY,
    truck_name VARCHAR(100) NOT NULL,
    location_name VARCHAR(150),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    food_stock INTEGER NOT NULL DEFAULT 0 CHECK (food_stock >= 0),
    water_stock INTEGER NOT NULL DEFAULT 0 CHECK (water_stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE drivers (
    driver_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    assigned_truck_id INTEGER REFERENCES trucks(truck_id) ON DELETE SET NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'driver'
);

CREATE TABLE restock_locations (
    restock_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(200) NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    food_available BOOLEAN NOT NULL DEFAULT true,
    water_available BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE requests (
    request_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    message TEXT,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO trucks (
    truck_name,
    location_name,
    latitude,
    longitude,
    food_stock,
    water_stock,
    is_active
)
VALUES
(
    'Truck 1',
    'Ladywood Community Centre',
    52.481200,
    -1.923000,
    50,
    100,
    true
),
(
    'Truck 2',
    'Summerfield Park',
    52.486100,
    -1.930200,
    25,
    60,
    false
);

INSERT INTO restock_locations (
    name,
    address,
    latitude,
    longitude,
    food_available,
    water_available
)
VALUES
(
    'Ladywood Food Bank',
    'Ladywood Road, Birmingham',
    52.480500,
    -1.921500,
    true,
    true
),
(
    'Community Water Point',
    'Summerfield Park, Birmingham',
    52.486300,
    -1.930000,
    false,
    true
),
(
    'Local Supply Hub',
    'Icknield Port Road, Birmingham',
    52.489100,
    -1.926500,
    true,
    true
);

INSERT INTO drivers (full_name, email, password, assigned_truck_id, role)
VALUES ('Test Driver', 'driver@example.com', 'password123', 2, 'driver');


-- Request data:

INSERT INTO requests (user_name, message, latitude, longitude, status)
VALUES
('Resident 1', 'Requires 4L Water', 55.3958, -1.4992, 'Pending'),
('Resident 2', 'Requires fruits and vegetables', 54.5932, -1.6992, 'Pending'),
('Resident 3', 'Needs eggs', 53.9921, -1.5993, 'Pending');
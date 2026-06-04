const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const driverRoutes = require("./routes/driverRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/drivers", driverRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/driver", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "driver.html"));
});

app.get("/driverDash", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "driverDash.html"));
});

app.get("/debug/session", (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionID: req.sessionID,
    sessionData: req.session
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

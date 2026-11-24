const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const ensureAdmin = require("./utils/ensureAdmin");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// AUTH
app.use("/api/auth", require("./routes/authRoutes"));


// USER MANAGEMENT
app.use("/api/users", require("./routes/userRoutes"));


// SPECIES MANAGEMENT
app.use("/api/species", require("./routes/speciesRoutes"));


app.use("/api/habitats", require("./routes/habitatRoutes"));

app.use(
  "/api/sightings",
  require("./routes/sightingRoutes")
);

app.use(
  "/api/incidents",
  require("./routes/incidentRoutes")
);
app.use(
  "/api/research",
  require("./routes/researchRoutes")
);
app.use(
  "/api/map",
  require("./routes/mapRoutes")
);
app.get("/", (req, res) => {
  res.json({
    message: "Wildlife Conservation API is running"
  });
});

app.use(
  "/api/projects",
  require("./routes/projectRoutes")
);
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

const startServer = async () => {
  await connectDB();
  await ensureAdmin();

  app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

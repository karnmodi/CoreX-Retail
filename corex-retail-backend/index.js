const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// const { db, auth } = require("./src/config/firebase");
const staffRoutes = require("./src/routes/staffRoutes")
const authRoutes = require("./src/routes/authRoutes")
const inventoryRoutes = require("./src/routes/inventoryRoutes")

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Sample API Route
app.get("/", (req, res) => {
  res.send("CoreX Retail Backend is running...");
});

app.use("/auth", authRoutes)
app.use("/employees", staffRoutes)
app.use("/inventory", inventoryRoutes)

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

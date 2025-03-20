const express = require("express");
const { loginUser_BE } = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginUser_BE);

module.exports = router;
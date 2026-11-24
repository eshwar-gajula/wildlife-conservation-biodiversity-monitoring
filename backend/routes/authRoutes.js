const express = require("express");

const {
  register,
  login
} = require("../controllers/authController");

const router = express.Router();


// Public User Registration
router.post("/register", register);


// Login for all existing users
router.post("/login", login);


module.exports = router;
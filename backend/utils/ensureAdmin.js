const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ensureAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env");
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existingAdmin) {
    existingAdmin.name = ADMIN_NAME || existingAdmin.name;
    existingAdmin.password = password;
    existingAdmin.role = "admin";
    existingAdmin.status = "active";
    existingAdmin.createdBy = null;
    await existingAdmin.save();
    console.log("Admin account ready");
    return existingAdmin;
  }

  const admin = await User.create({
    name: ADMIN_NAME || "Platform Administrator",
    email: ADMIN_EMAIL,
    password,
    role: "admin",
    status: "active",
    createdBy: null,
  });

  console.log("Admin account created");
  return admin;
};

module.exports = ensureAdmin;

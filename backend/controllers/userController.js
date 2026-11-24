const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =====================================
// CREATE FIELD OFFICER
// =====================================

const createFieldOfficer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const fieldOfficer = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,

      role: "field_officer",

      status: "active",

      // Admin who created this account
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Field Officer created successfully",

      user: {
        id: fieldOfficer._id,
        name: fieldOfficer.name,
        email: fieldOfficer.email,
        phone: fieldOfficer.phone,
        role: fieldOfficer.role,
        status: fieldOfficer.status,
        createdBy: fieldOfficer.createdBy
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create Field Officer",
      error: error.message
    });
  }
};


// =====================================
// CREATE RESEARCHER
// =====================================

const createResearcher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const researcher = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,

      role: "researcher",

      status: "active",

      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Researcher created successfully",

      user: {
        id: researcher._id,
        name: researcher.name,
        email: researcher.email,
        phone: researcher.phone,
        role: researcher.role,
        status: researcher.status,
        createdBy: researcher.createdBy
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create Researcher",
      error: error.message
    });
  }
};


// =====================================
// GET ALL FIELD OFFICERS
// =====================================

const getFieldOfficers = async (req, res) => {
  try {
    const officers = await User.find({
      role: "field_officer"
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: officers.length,
      users: officers
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Field Officers",
      error: error.message
    });
  }
};


// =====================================
// GET ALL RESEARCHERS
// =====================================

const getResearchers = async (req, res) => {
  try {
    const researchers = await User.find({
      role: "researcher"
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: researchers.length,
      users: researchers
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Researchers",
      error: error.message
    });
  }
};


// =====================================
// GET SINGLE USER
// =====================================

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Admin can view only field officer/researcher
    if (
      user.role !== "field_officer" &&
      user.role !== "researcher"
    ) {
      return res.status(403).json({
        message: "Cannot manage this user"
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    });
  }
};


// =====================================
// UPDATE USER
// =====================================

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (
      user.role !== "field_officer" &&
      user.role !== "researcher"
    ) {
      return res.status(403).json({
        message: "Cannot update this user"
      });
    }

    const {
      name,
      email,
      phone
    } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.message
    });
  }
};


// =====================================
// CHANGE USER STATUS
// =====================================

const changeUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (
      user.role !== "field_officer" &&
      user.role !== "researcher"
    ) {
      return res.status(403).json({
        message: "Cannot change this user's status"
      });
    }

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or inactive"
      });
    }

    user.status = status;

    await user.save();

    res.status(200).json({
      message: `User ${status} successfully`,
      status: user.status
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to change user status",
      error: error.message
    });
  }
};


// =====================================
// DELETE USER
// =====================================

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (
      user.role !== "field_officer" &&
      user.role !== "researcher"
    ) {
      return res.status(403).json({
        message: "Cannot delete this user"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });
  }
};


module.exports = {
  createFieldOfficer,
  createResearcher,
  getFieldOfficers,
  getResearchers,
  getUserById,
  updateUser,
  changeUserStatus,
  deleteUser
};
const express = require("express");
const router = express.Router();

const {
    getUsers,
    getUserById,
    updatePassword,
    adminUpdatePassword
} = require("../controller/userController");

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorized");
const auth = require('../middleware/auth')

// Get all users - Admin only
router.get("/getUser", auth, authorize("admin"), getUsers);

// Get one user by ID - Admin only
router.get("/:id", auth, authorize("admin"), getUserById);

// User updates own password
router.put("/update-password", auth, updatePassword);

// Admin updates a user's password
router.put(
    "/admin/update-password/:id",
    auth,
    authorize("admin"),
    adminUpdatePassword
);

module.exports = router;


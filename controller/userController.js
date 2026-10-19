const User = require("../models/user");
const bcrypt = require("bcrypt");

// GET ALL USERS - ADMIN ONLY

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET USER BY ID - ADMIN ONLY

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// UPDATE OWN PASSWORD
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Please provide old password and new password"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check old password
        const passwordMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// ADMIN UPDATE USER PASSWORD
const adminUpdatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "Please provide new password"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "User password updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// EXPORT

module.exports = {
    getUsers,
    getUserById,
    updatePassword,
    adminUpdatePassword
};
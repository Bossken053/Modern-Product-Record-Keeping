const express = require("express");

const router = express.Router();

const {
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgottenPassword,
    resetPassword
} = require("../controller/authController");


// Registration
router.post("/register-user", register);


// Login
router.post("/login", login);


// Logout
router.post("/logout", logout);

//verify email
router.get("/verifyEmail/:token", verifyEmail);

//resendVerificationEmail
router.post ("/resendVerificationEmail", resendVerificationEmail)

//forgottenPassword
router.post ("/forgottenPassword", forgottenPassword)

//  resetPassword
router.post ("/resetPassword/:token", resetPassword)

module.exports = router;
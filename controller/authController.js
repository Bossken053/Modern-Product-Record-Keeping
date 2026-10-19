const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require ("crypto")
const transporter = require("../config/mailer");


// REGISTER USER

const register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            confirmPassword,
            phone,
        } = req.body || {};

        // Check all required data
        if (!fullName || !email || !password || !confirmPassword || !phone ) {
            return res.status(400).json({
                message: "Please fill all data"
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Password don't match"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phone,
            role: "user"
        });

        //email verify link
        const emailToken = crypto.randomBytes(32).toString("hex");
        const hashToken = crypto.createHash("sha256").update(emailToken).digest("hex")
        newUser.emailVerifyToken = hashToken
        newUser.emailVerifyExpire = Date.now()+30*60*1000
    
        await newUser.save();
        const link = `${process.env.CLIENT_URL}/verifyEmail.html?token=${emailToken}`;
        const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: newUser.email,
    subject: "Email Verification Code",
    html: `Click <a href="${link}">Here</a> to verify your email, This token expires in 15 minutes.` });

        res.status(201).json({
            message: "Registration successful", emailToken
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
};
}

const verifyEmail = async (req, res)=>{
    try{
        const emailToken = req.params.token
        const hashToken = crypto.createHash("sha256").update(emailToken).digest("hex")

        const user = await User.findOne({emailVerifyToken: hashToken,
            emailVerifyExpire: {$gt: Date.now()}
        });
        if (!user){
            return res.status (401).json ({message: "invalid or expire token"})
        }
        user.isVerified = true
        user.emailVerifyToken = undefined
        user.emailVerifyExpire = undefined
        await user.save()
        
         res.status(200).json({ message: "email verify successful" })


    } catch (error) {
        res.status(500).json({
            message: error.message
        });
}
};


// To resend Verification Email to registered users
const resendVerificationEmail = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        if (!email) { return res.status(400).json({ message: "Please enter your email" });
        }
        const user = await User.findOne({ email });
        if (!user) { return res.status(404).json({ message: "User not found" });
        }
        if (user.isVerified) { return res.status(400).json({ message: "Email is already verified"  });
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.emailVerifyToken = crypto.createHash("sha256").update(token).digest("hex");
        user.emailVerifyExpire = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
         const link = `${process.env.CLIENT_URL}/verifyEmail.html?token=${token}`;
        const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Email Verification Code",
    html: `Click <a href="${link}">Here</a> to verify your email, This token expires in 15 minutes.` });

    } catch (error) {
        console.error("RESEND EMAIL ERROR:", error);
        return res.status(500).json({ message: "Failed to resend verification email",  error: error.message });
    }
};

const forgottenPassword = async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne ({email})
    if (!user){
        return res.status (404).json ({message: "user not Found"})
    }
         const resetToken = crypto.randomBytes(32).toString("hex");
        const hashToken =crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetToken = hashToken 
        user.passwordResetExpire = Date.now() + 30*60*1000
        await user.save()
         return res.status (200).json ({message: "Reset Password has been sent", resetToken})
};

// resetPassword
    const resetPassword = async (req, res) =>{
    const token = req.params.token 
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne ({passwordResetToken: hashToken, 
        passwordResetExpire: {$gt: Date.now()}
    })
    
    if (!user){
         return res.status (404).json ({message: "user not Found"})
    }

    const {password, confirmPassword} =req.body
    const hashPassword = await bcrypt.hash (password,10)
    user.password = hashPassword
    user.passwordResetToken = undefined
    user.PasswordResetExpire = undefined 
    await user.save()
     return res.status (200).json ({message: "Password Reset successful"})
}


// LOGIN

const login = async (req, res) => {
      const Max_login_Attempt = 5
      const lock_Time = 10*60*1000
    try {
        const {
            email,
            password
        } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        // Find user
        const existingUser = await User.findOne({ email });
      

        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        if (!existingUser.isVerified) {
            return res.status(401).json({
                message: "email not verified" });
        }
          if (existingUser.isLocked()){
            return res.status(403).json({ message: "Account is locked."})
          }

        
        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!passwordMatch) {
            existingUser.loginAttempt +=1;
            if (existingUser.loginAttempt >= Max_login_Attempt){
                existingUser.lockUntil = Date.now() + lock_Time
            }
                await existingUser.save()
                    return res.status(400).json({ message: "Invalid Password"})
            }

        // Create token
        const token = jwt.sign(
            {
                id: existingUser._id,
                role: existingUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d" 
            }
        );

        res.cookie('token', token,{
httpOnly: true,
secure: false,
sameSite: "lax",
maxAge: 24*60*60*1000
});

        res.status(200).json({
            message: "Login successful",

            data: {
                id: existingUser._id,
                fullName: existingUser.fullName,
                email: existingUser.email,
                phone: existingUser.phone,
                role: existingUser.role
            },

            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//logout 
    const logout = (req, res) => {
    res.clearCookie("token", {
httpOnly: true,
secure: false,
sameSite: "lax"
});
res.status(200).json({
        message: "Logout Successful"
});
};




// EXPORT

module.exports = {
    register,
    verifyEmail,
    resendVerificationEmail,
    login,
    resetPassword,
    logout,
    forgottenPassword,
};
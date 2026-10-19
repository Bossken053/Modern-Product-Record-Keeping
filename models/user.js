const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user"
        },
        loginAttempt:{type: Number, 
        default: 0},
    lockUntil: {type: Date},
    
    emailVerifyToken: {type: String},
    emailVerifyExpire: {type: Date},
    isVerified: {type: Boolean,
        default: false
    },
    passwordResetToken: {type: String},
    passwordResetExpire: {type: Date},
    isVerified: {type: Boolean,
        default: false
    }
    },

    {
        timestamps: true
    }
);
 userSchema.methods.isLocked= function(){
        return !!(this.lockUntil && this.lockUntil > Date.now());
    }



module.exports = mongoose.model("User", userSchema);
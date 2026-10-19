require ("dotenv").config();


const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute"); 


const connectDB = require("./config/db");



// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "API is working"
    });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
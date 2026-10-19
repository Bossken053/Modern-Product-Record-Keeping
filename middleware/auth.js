const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const token = req.cookies.token
    console.log(token)
    if(!token){
        return res.status(401).json({
            message:"Not authorized"
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
catch(error){
    return res.status (401).json ({
        message: error.message
    });
}
}

module.exports = auth;
const jwt = require("jsonwebtoken");

// generate we token
exports.generateToken=(payload,expired)=>{
    return jwt.sign(payload,process.env.TOKEN_SECRET,{
        expiresIn:expired
    })
}
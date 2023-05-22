let jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = function authGaurd(role)
{

return async function verify(req,res,next)
{
    try{
    let authHeader = req.headers.authorization;
    if(!authHeader)
    {
        res.status(401).send("no token");
        return("");
    }
    let token = authHeader.split(" ")[1];
    let user = jwt.verify(token,config.jwtSecret);
    if(user)
    {
        req.user  = user;
        if(role.includes(user.role))
        {   
            console.log(user);
            next();
        }else{
            res.status(401).send("Unauthorised");
        }
    }else{
        res.status(401).send("invalid Jwt token");
    }
}
catch(e)
{
    console.log("error in auth ",e);
    res.status(500).send("internal server error");
}

}
}
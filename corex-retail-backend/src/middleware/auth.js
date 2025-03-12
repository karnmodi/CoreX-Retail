const { auth } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(401).json({message: "unauthorized"});

        const decodedToken  = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();

    } catch(error) {
        res.status(403).json({message:"Invalid Token"});
    }
}

module.exports = verifyToken;
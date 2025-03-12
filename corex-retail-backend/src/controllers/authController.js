const { getIdToken } = require("firebase/auth");
const { auth } = require("../config/firebase");
const { doc, getDoc } = require("firebase/firestore");

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.getUserByEmail(email);
        

        res.status(200).json({
            message: "Login successful",
            userId: user.uid,
          });
          
    } catch (error) {
        res.status(400).json({error:"Invalid Email or Password"});
    }
};

module.exports = { loginUser }
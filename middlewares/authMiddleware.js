import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected routes token base
export const requireSignIn = async (req, res, next) => {
    try {
        const decode = JWT.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        );
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);

        // FIXED BUG: send response with unsuccessful message if error occurs
        res.status(401).send({
            success: false,
            message: "Error in admin middleware",
            error,
        }); 
    }
};

//admin access
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if(user.role !== 1) {
            // FIXED BUG: Message typo
            // message: "UnAuthorized Access"
            return res.status(401).send({
                success: false,
                message: "Unauthorized Access",
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        // FIXED BUG: reordered message and error
        res.status(401).send({
            success: false,
            message: "Error in admin middleware",
            error,
        });
    }
};
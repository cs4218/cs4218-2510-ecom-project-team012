import userModel from "../../models/userModel.js";
import { hashPassword } from "../../helpers/authHelper.js";

export const updateProfileController = async (req, res) => {
    try {
        const { name, password, address, phone } = req.body;

        if (password && password.length < 6) {
        return res.status(400).send({
            success: false,
            message: "Password must be at least 6 characters",
        });
        }

        const user = await userModel.findById(req.user._id);
        const hashedPassword = password ? await hashPassword(password) : undefined;

        const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address,
        },
        { new: true }
        );

        return res.status(200).send({
        success: true,
        message: "Profile updated successfully",
        updatedUser,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
        success: false,
        message: "Error while updating profile",
        error,
        });
    }
};

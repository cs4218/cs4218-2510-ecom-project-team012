import userModel from "../../models/userModel.js";
import { hashPassword } from "./../../helpers/authHelper.js";

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    //FIXED BUG: Added success attribute to the response messages
    if (!email) {
      res.status(400).send({
        success: false,
        message: "Email is required"
      });
    }
    if (!answer) {
      res.status(400).send({
        success: false,
        message: "Answer to security question is required"
      });
    }
    if (!newPassword) {
      res.status(400).send({
        success: false,
        message: "New password is required"
      });
    }

    const user = await userModel.findOne({ email, answer });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email or answer",
      });
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};
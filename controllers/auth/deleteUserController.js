import userModel from "../../models/userModel.js";

export const deleteUserController = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.uid);
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting user",
      error,
    });
  }
};
import userModel from "../../models/userModel.js";

import { hashPassword } from "./../../helpers/authHelper.js";

export const registerController = async (req, res) => {
  try {
    // FIXED BUG: missing DOB variable
    const { name, email, password, phone, address, dob, answer } = req.body;

    // FIXED BUG: 
    // Add HTTP code for responses
    // Standardise content of response to be success flag and message
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Password is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "Phone number is required",
      });
    }
    if (!address) {
      return res.status(400).send({
        success: false,
        message: "Address is required",
      });
    }
    // FIXED BUG: missing DOB validation
    if (!dob) {
      return res.status(400).send({
        success: false,
        message: "Date of birth is required",
      });
    }
    if (!answer) {
      return res.status(400).send({
        success: false,
        message: "Answer to the security question is required",
      });
    }

    // FIXED BUG: typo
    // const exisitingUser...
    const existingUser = await userModel.findOne({ email });

    // FIXED BUG: typo
    // if(exisitingUser){...
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Already registered, please login",
      });
    }

    const hashedPassword = await hashPassword(password);

    // FIXED BUG: added DOB
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      dob,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
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
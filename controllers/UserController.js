const UserService = require("../services/UserService");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage, dest: "uploads/" });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    console.log("Register request received:", {
      email,
      passwordLength: password.length,
      name,
      mobile,
    });

    const successRes = await UserService.registerUser(
      name,
      email,
      password,
      mobile
    );

    console.log("Registration response:", successRes);

    if (successRes.success) {
      res.status(201).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", {
      email,
      passwordProvided: !!password,
      passwordLength: password?.length,
    });

    const user = await UserService.checkUser(email);
    if (!user) {
      return res
        .status(401)
        .json({ status: false, error: "Invalid email or password" });
    }

    console.log("Found user, attempting password comparison");
    // Use the mongoose model's comparePassword method directly
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, error: "Invalid email or password" });
    }

    const tokenData = { _id: user._id, email: user.email, name: user.name };
    const token = await UserService.genarateToken(
      tokenData,
      "secretkey",
      "120h"
    );

    console.log("Login successful, token generated");
    res.status(200).json({ status: true, token: token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { email, lat, lng } = req.body;

    // Check if user exists
    const user = await UserService.checkUser(email);
    if (!user) {
      // Log detailed error for internal use
      console.error("Update Location Error: User not found");

      // Send generic error response
      return res.status(401).json({ status: false, error: "Invalid User" });
    }

    // Update the location
    const successRes = await UserService.updateUserLocation(email, lat, lng);

    // Handle the response based on the successRes
    if (successRes.success) {
      res.status(200).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    // Log the error details
    console.error("Update Location Error:", error);

    // Send internal server error response
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};
exports.updateAddress = async (req, res, next) => {
  try {
    const { email, street, city, state, zip, latitude, longitude } = req.body;

    // Check if user exists
    const user = await UserService.checkUser(email);
    if (!user) {
      // Log detailed error for internal use
      console.error("Update Address Error: User not found");

      // Send generic error response
      return res.status(401).json({ status: false, error: "Invalid User" });
    }

    // Update the location
    const successRes = await UserService.UpdateUserAddress(
      email,
      street,
      city,
      state,
      zip,
      latitude,
      longitude
    );

    // Handle the response based on the successRes
    if (successRes.success) {
      res.status(200).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    // Log the error details
    console.error("Update Address Error:", error);

    // Send internal server error response
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};
exports.updateUserData = async (req, res, next) => {
  try {
    const { email, name, mobile, street, city, state, zip } = req.body;
    console.log("update user");

    // Check if user exists
    const user = await UserService.checkUser(email);
    if (!user) {
      // Log detailed error for internal use
      console.error("Update Address Error: User not found");

      // Send generic error response
      return res.status(401).json({ status: false, error: "Invalid User" });
    }

    // Update the location
    const successRes = await UserService.UpdateUserData(
      email,
      name,
      mobile,
      street,
      city,
      state,
      zip
    );

    // Handle the response based on the successRes
    if (successRes.success) {
      res.status(200).json({ status: true, success: successRes.message });
    } else {
      res.status(400).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    // Log the error details
    console.error("Update Address Error:", error);

    // Send internal server error response
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const { email } = req.body;
    const successRes = await UserService.getUserById(email);
    console.log(successRes);
    if (successRes.success) {
      res.status(200).json({ status: true, user: successRes.user });
    } else {
      res.status(404).json({ status: false, error: successRes.message });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

exports.updateProfilePicture = async (req, res, next) => {
  upload.single("profilepicture")(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res
        .status(400)
        .json({ status: false, error: "File upload failed" });
    }

    try {
      const { email } = req.body;

      // Check if user exists
      const user = await UserService.checkUser(email);
      if (!user) {
        return res.status(401).json({ status: false, error: "Invalid User" });
      }

      // Ensure a file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ status: false, error: "No file uploaded" });
      }

      // Save the file path to the database
      const profilePicturePath = req.file.path;

      const successRes = await UserService.UpdateUserProfilePicture(
        email,
        profilePicturePath
      );

      if (successRes.success) {
        return res
          .status(200)
          .json({ status: true, success: successRes.message });
      } else {
        return res
          .status(400)
          .json({ status: false, error: successRes.message });
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res
        .status(500)
        .json({ status: false, error: "Internal Server Error" });
    }
  });
};

const User = require("../models/Usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class UserService {
  static async registerUser(name, email, password, mobile) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email }, { mobile: mobile }],
      });
      if (existingUser) {
        return { success: false, message: "User already exists" };
      }

      // If user doesn't exist, create a new user
      const newUser = new User({ name, email, password, mobile });
      await newUser.save();
      return { success: true, message: "User registered successfully" };
    } catch (error) {
      throw new Error("Error while registering user");
    }
  }

  static async checkUser(email) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      return existingUser;
    } catch (error) {
      throw error;
    }
  }
  static async comparePassword(user, password) {
    try {
      const isMatch = await bcrypt.compare(user, password);
      console.log(isMatch);
      return isMatch;
    } catch (error) {
      console.error("Error comparing password:", error);
      return false;
    }
  }
  static async updateUserLocation(email, lat, lng) {
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Update the user's location
      user.location = { lat, lng };
      await user.save();

      return { success: true, message: "Location updated successfully" };
    } catch (error) {
      throw new Error("Error while updating location");
    }
  }

  static async genarateToken(data, secretkey, jwtExp) {
    return jwt.sign(data, secretkey, { expiresIn: jwtExp });
  }

  static async UpdateUserAddress(
    email,
    street,
    city,
    state,
    zip,
    latitude,
    longitude
  ) {
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Update the user's location
      user.address = { street, city, state, zip };
      user.location = { lat: latitude, lng: longitude };
      await user.save();

      return { success: true, message: "Address updated successfully" };
    } catch (error) {
      throw new Error("Error while updating location", error);
    }
  }
  static async UpdateUserData(email, name, mobile, street, city, state, zip) {
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Update the user's location
      user.name = name;
      user.mobile = mobile;
      user.address = { street, city, state, zip };
      // user.location = { lat: latitude, lng: longitude };
      await user.save();

      return { success: true, message: "Address updated successfully" };
    } catch (error) {
      throw new Error("Error while updating location", error);
    }
  }

  static async getUserById(email) {
    try {
      const user = await User.findOne({ email }).select("-password"); // Exclude the password field
      if (!user) {
        return { success: false, message: "User not found" };
      }
      return { success: true, user: user };
    } catch (error) {
      console.error("Error while fetching user details:", error);
      throw new Error("Error while fetching user details");
    }
  }
  static async UpdateUserProfilePicture(email, profilePicturePath) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Save the image path
      user.profilepicture = profilePicturePath;
      await user.save();

      return { success: true, message: "Picture updated successfully" };
    } catch (error) {
      throw new Error("Error while updating picture", error);
    }
  }

  static async getUserById(email) {
    try {
      const user = await User.findOne({ email }).select("-password");
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Convert profile picture path to accessible URL
      const profilePictureUrl = user.profilePicturePath
        ? `/uploads/${path.basename(user.profilePicturePath)}`
        : null;

      return {
        success: true,
        user: { ...user._doc, profilePicturePath: profilePictureUrl },
      };
    } catch (error) {
      console.error("Error while fetching user details:", error);
      throw new Error("Error while fetching user details");
    }
  }
}

module.exports = UserService;

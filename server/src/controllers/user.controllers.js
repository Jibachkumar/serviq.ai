import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../utils/logger.js";

// helper function
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info("Access and refresh tokens generated");

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error("Error in generating access and refresh tokens", {
      error: error.message,
    });
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token",
    );
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { username, email, address, phoneNumber, password } = req.body;

    // check user already exit
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      logger.warn("User with email already exists");
      throw new ApiError(409, "User with email is already exits");
    }

    // create user
    const user = await User.create({
      username,
      email,
      address,
      phoneNumber,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    logger.info("User registered successfully");

    if (!createdUser) {
      logger.warn("user registering failed");
      throw new ApiError(
        500,
        "Something went wrong while registering the user",
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered Successfully"));
  } catch (error) {
    logger.error(`Error in registerUser controller ${error.message}`);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login failed: user not found");
      throw new ApiError(404, "user not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      logger.warn("Login failed: incorrect password");
      throw new ApiError(401, "Password is Incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    logger.info("User logged in successfully");
    // return response
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged In Successfully",
        ),
      );
  } catch (error) {
    logger.error(`Error in loginUser controller: ${error.message}`);
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true },
    );

    logger.info("User logged out successfully");

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ user: {}, message: "User Logged Out Successfully" });
  } catch (error) {
    logger.error("Error in logoutUser controller", { error: error.message });
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  logger.info("user fetched successfully");
  return res
    .status(200)
    .json({ user: req?.user, message: "user fetched successfully" });
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      logger.warn("Refresh token missing in request");
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      logger.warn("User not found for provided refresh token");
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      logger.warn("Refresh token is expired or already used");
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    logger.info("Access token refreshed successfully");

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ accessToken, refreshToken, message: "Access token refreshed" });
  } catch (error) {
    logger.error("Error in refreshAccessToken controller", {
      error: error.message,
    });
    next(error);
  }
};

export { registerUser, loginUser, logoutUser };

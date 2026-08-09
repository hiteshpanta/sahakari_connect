const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/appError');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async (userId, req, rememberMe = false) => {
  const token = crypto.randomBytes(40).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7)); // 30 days for remember me, 7 days otherwise
  
  await RefreshToken.create({
    user: userId,
    token: hashedToken,
    expiresAt,
    createdByIp: req.ip,
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
  
  return { token, expiresAt };
};

const setRefreshTokenCookie = (res, token, expiresAt) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, rememberMe } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  // Public registration cannot create admin (platform) accounts
  const allowedRoles = ['member', 'manager', 'staff'];
  const safeRole = allowedRoles.includes(role) ? role : 'member';

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    // branch,
    cooperativeId: null,
    status: 'active',
  });

  if (user) {
    // Send Verification Email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${user._id}`;
    const message = `Please verify your email by clicking the following link: \n\n ${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message,
      });
    } catch (error) {
      console.error('Email could not be sent', error);
      // We do not fail registration if email fails to send, but log it
    }

    const { token: refreshToken, expiresAt } = await generateRefreshToken(user._id, req, rememberMe);
    setRefreshTokenCookie(res, refreshToken, expiresAt);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // branch: user.branch,
      cooperativeId: user.cooperativeId,
      token: generateAccessToken(user._id),
    });
  } else {
    return next(new AppError('Invalid user data', 400));
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user && (await user.matchPassword(password))) {

    // Block inactive users
    // if (user.status !== 'active') {
    //   return next(new AppError('Account pending approval', 403));
    // }

    const { token: refreshToken, expiresAt } = await generateRefreshToken(user._id, req, rememberMe);
    setRefreshTokenCookie(res, refreshToken, expiresAt);

    const setAccessTokenCookie = (res, token) => {
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
    };

    const accessToken = generateAccessToken(user._id);

    setAccessTokenCookie(res, accessToken);

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      cooperativeId: user.cooperativeId,
      avatar: user.avatar,
    };

    // Include customerId for member users
    if (user.role === 'member' && user.customerId) {
      response.customerId = user.customerId;
    }

    res.json(response);

  } else {
    return next(new AppError('Invalid email or password', 401));
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Not authorized, no refresh token', 401));
  }

  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const existingToken = await RefreshToken.findOne({ token: hashedToken }).populate('user');

  if (!existingToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  if (existingToken.isExpired || existingToken.revokedAt) {
    // Token reuse detection or simply expired
    if (existingToken.revokedAt) {
      // Possible token theft, revoke all tokens for this user
      await RefreshToken.updateMany({ user: existingToken.user._id }, { revokedAt: new Date() });
    }
    return next(new AppError('Refresh token expired or revoked. Please login again', 401));
  }

  // Revoke current token and generate new one (rotation)
  existingToken.revokedAt = new Date();
  await existingToken.save();

  const { token: newRefreshToken, expiresAt } = await generateRefreshToken(existingToken.user._id, req);
  setRefreshTokenCookie(res, newRefreshToken, expiresAt);

  const accessToken = generateAccessToken(existingToken.user._id);

  // Also rotate the httpOnly access-token cookie so cookie-based clients stay authenticated
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.json({ token: accessToken });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshToken.findOneAndUpdate(
      { token: hashedToken },
      { revokedAt: new Date() }
    );
  }

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'User logged out' });
});

// @desc    Logout user from all devices
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = asyncHandler(async (req, res, next) => {
  await RefreshToken.updateMany(
    { user: req.user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Logged out from all devices' });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message
    });
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Optionally login the user immediately after reset
  const { token: refreshToken, expiresAt } = await generateRefreshToken(user._id, req);
  setRefreshTokenCookie(res, refreshToken, expiresAt);

  res.status(200).json({
    success: true,
    token: generateAccessToken(user._id)
  });
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Return the user document with raw cooperativeId / customerId ids (as strings)
  // so client redirects like `/c/${cooperativeId}/dashboard` keep working after reload.
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json(user);
});

exports.approveUser = asyncHandler(async(req,res)=>{

const { cooperativeId } = req.body;


const user = await User.findById(req.params.id);


if(!user){
 return next(
  new AppError("User not found",404)
 );
}


user.cooperativeId = cooperativeId;
user.status = "active";
user.isVerified = true;


await user.save();


res.json({
 message:"User approved successfully",
 user
});

});


const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/appError');

// ======================================================
// ACCESS TOKEN
// ======================================================

const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    }
  );
};

// ======================================================
// REFRESH TOKEN
// ======================================================

const generateRefreshToken = async (
  userId,
  req,
  rememberMe = false
) => {
  const token = crypto
    .randomBytes(40)
    .toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
      (rememberMe ? 30 : 7)
  );

  await RefreshToken.create({
    user: userId,
    token: hashedToken,
    expiresAt,
    createdByIp: req.ip,
    userAgent:
      req.headers['user-agent'] || 'Unknown',
  });

  return {
    token,
    expiresAt,
  };
};

// ======================================================
// COOKIE OPTIONS
// ======================================================
//
// IMPORTANT:
//
// Frontend:
// https://sahakari.hiteshpant.com.np
//
// Backend:
// https://sahakari-connect.onrender.com
//
// These are cross-site, so production cookies must use:
//
// sameSite: 'none'
// secure: true
//
// ======================================================

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction
      ? 'none'
      : 'lax',

    path: '/',
  };
};

// ======================================================
// SET REFRESH TOKEN COOKIE
// ======================================================

const setRefreshTokenCookie = (
  res,
  token,
  expiresAt
) => {
  res.cookie(
    'refreshToken',
    token,
    {
      ...getCookieOptions(),
      expires: expiresAt,
    }
  );
};

// ======================================================
// SET ACCESS TOKEN COOKIE
// ======================================================

const setAccessTokenCookie = (
  res,
  token
) => {
  res.cookie(
    'accessToken',
    token,
    {
      ...getCookieOptions(),

      maxAge:
        15 * 60 * 1000,
    }
  );
};

// ======================================================
// CLEAR AUTH COOKIES
// ======================================================

const clearAuthCookies = (res) => {
  const options = getCookieOptions();

  res.clearCookie(
    'accessToken',
    options
  );

  res.clearCookie(
    'refreshToken',
    options
  );
};

// ======================================================
// REGISTER USER
// ======================================================
//
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
//
// ======================================================

exports.registerUser = asyncHandler(
  async (req, res, next) => {
    const {
      name,
      email,
      password,
      role,
      rememberMe,
    } = req.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const userExists =
      await User.findOne({
        email: normalizedEmail,
      });

    if (userExists) {
      return next(
        new AppError(
          'User already exists',
          400
        )
      );
    }

    // Public registration cannot create
    // administrator/platform accounts.
    const allowedRoles = [
      'member',
      'manager',
      'staff',
    ];

    const safeRole =
      allowedRoles.includes(role)
        ? role
        : 'member';

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: safeRole,
      cooperativeId: null,
      status: 'active',
    });

    if (!user) {
      return next(
        new AppError(
          'Invalid user data',
          400
        )
      );
    }

    // ==================================================
    // SEND VERIFICATION EMAIL
    // ==================================================

    const verificationUrl =
      `${process.env.FRONTEND_URL}/verify/${user._id}`;

    const message =
      `Please verify your email by clicking the following link:\n\n${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message,
      });
    } catch (error) {
      console.error(
        'Email could not be sent',
        error
      );

      // Registration should not fail
      // if email delivery fails.
    }

    // ==================================================
    // CREATE REFRESH TOKEN
    // ==================================================

    const {
      token: refreshToken,
      expiresAt,
    } = await generateRefreshToken(
      user._id,
      req,
      rememberMe
    );

    setRefreshTokenCookie(
      res,
      refreshToken,
      expiresAt
    );

    // ==================================================
    // CREATE ACCESS TOKEN
    // ==================================================

    const accessToken =
      generateAccessToken(user._id);

    setAccessTokenCookie(
      res,
      accessToken
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({
      success: true,

      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cooperativeId:
        user.cooperativeId,

      // Return token as well for clients
      // that use Authorization headers.
      token: accessToken,
    });
  }
);

// ======================================================
// LOGIN USER
// ======================================================
//
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
//
// ======================================================

exports.loginUser = asyncHandler(
  async (req, res, next) => {
    const {
      email,
      password,
      rememberMe,
    } = req.body;

    if (!email || !password) {
      return next(
        new AppError(
          'Email and password are required',
          400
        )
      );
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (
      !user ||
      !(await user.matchPassword(password))
    ) {
      return next(
        new AppError(
          'Invalid email or password',
          401
        )
      );
    }

    // ==================================================
    // OPTIONAL ACCOUNT STATUS CHECK
    // ==================================================
    //
    // Uncomment if inactive users should not log in.
    //
    // if (user.status !== 'active') {
    //   return next(
    //     new AppError(
    //       'Account pending approval',
    //       403
    //     )
    //   );
    // }

    // ==================================================
    // CREATE REFRESH TOKEN
    // ==================================================

    const {
      token: refreshToken,
      expiresAt,
    } = await generateRefreshToken(
      user._id,
      req,
      rememberMe
    );

    setRefreshTokenCookie(
      res,
      refreshToken,
      expiresAt
    );

    // ==================================================
    // CREATE ACCESS TOKEN
    // ==================================================

    const accessToken =
      generateAccessToken(user._id);

    setAccessTokenCookie(
      res,
      accessToken
    );

    // ==================================================
    // BUILD RESPONSE
    // ==================================================

    const response = {
      success: true,

      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      cooperativeId:
        user.cooperativeId,
      avatar: user.avatar,

      // Keep token in response for
      // Authorization-header clients.
      token: accessToken,
    };

    // Include customerId for member users.
    if (
      user.role === 'member' &&
      user.customerId
    ) {
      response.customerId =
        user.customerId;
    }

    res.status(200).json(response);
  }
);

// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================
//
// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
//
// ======================================================

exports.refreshToken = asyncHandler(
  async (req, res, next) => {
    const {
      refreshToken,
    } = req.cookies;

    if (!refreshToken) {
      return next(
        new AppError(
          'Not authorized, no refresh token',
          401
        )
      );
    }

    const hashedToken =
      crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    const existingToken =
      await RefreshToken.findOne({
        token: hashedToken,
      }).populate('user');

    if (!existingToken) {
      return next(
        new AppError(
          'Invalid refresh token',
          401
        )
      );
    }

    // ==================================================
    // CHECK EXPIRATION / REVOCATION
    // ==================================================

    if (
      existingToken.isExpired ||
      existingToken.revokedAt
    ) {
      // Possible refresh-token reuse.
      if (existingToken.revokedAt) {
        await RefreshToken.updateMany(
          {
            user:
              existingToken.user._id,
          },
          {
            revokedAt:
              new Date(),
          }
        );
      }

      clearAuthCookies(res);

      return next(
        new AppError(
          'Refresh token expired or revoked. Please login again',
          401
        )
      );
    }

    // ==================================================
    // ROTATE REFRESH TOKEN
    // ==================================================

    existingToken.revokedAt =
      new Date();

    await existingToken.save();

    const {
      token: newRefreshToken,
      expiresAt,
    } = await generateRefreshToken(
      existingToken.user._id,
      req
    );

    setRefreshTokenCookie(
      res,
      newRefreshToken,
      expiresAt
    );

    // ==================================================
    // NEW ACCESS TOKEN
    // ==================================================

    const accessToken =
      generateAccessToken(
        existingToken.user._id
      );

    setAccessTokenCookie(
      res,
      accessToken
    );

    res.status(200).json({
      success: true,
      token: accessToken,
    });
  }
);

// ======================================================
// LOGOUT
// ======================================================
//
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
//
// ======================================================

exports.logout = asyncHandler(
  async (req, res, next) => {
    const {
      refreshToken,
    } = req.cookies;

    if (refreshToken) {
      const hashedToken =
        crypto
          .createHash('sha256')
          .update(refreshToken)
          .digest('hex');

      await RefreshToken.findOneAndUpdate(
        {
          token: hashedToken,
        },
        {
          revokedAt:
            new Date(),
        }
      );
    }

    // Clear BOTH access and refresh
    // authentication cookies.
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'User logged out',
    });
  }
);

// ======================================================
// LOGOUT ALL DEVICES
// ======================================================
//
// @desc    Logout user from all devices
// @route   POST /api/auth/logout-all
// @access  Private
//
// ======================================================

exports.logoutAll = asyncHandler(
  async (req, res, next) => {
    await RefreshToken.updateMany(
      {
        user: req.user._id,
        revokedAt: {
          $exists: false,
        },
      },
      {
        revokedAt:
          new Date(),
      }
    );

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message:
        'Logged out from all devices',
    });
  }
);

// ======================================================
// FORGOT PASSWORD
// ======================================================
//
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
//
// ======================================================

exports.forgotPassword =
  asyncHandler(
    async (req, res, next) => {
      const email =
        req.body.email
          ?.toLowerCase()
          .trim();

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return next(
          new AppError(
            'There is no user with that email',
            404
          )
        );
      }

      const resetToken =
        user.getResetPasswordToken();

      await user.save({
        validateBeforeSave: false,
      });

      const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const message =
        `You requested a password reset. Please use the following link:\n\n${resetUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject:
            'Password Reset Request',
          message,
        });

        res.status(200).json({
          success: true,
          message: 'Email sent',
        });
      } catch (error) {
        user.resetPasswordToken =
          undefined;

        user.resetPasswordExpire =
          undefined;

        await user.save({
          validateBeforeSave: false,
        });

        return next(
          new AppError(
            'Email could not be sent',
            500
          )
        );
      }
    }
  );

// ======================================================
// RESET PASSWORD
// ======================================================
//
// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
//
// ======================================================

exports.resetPassword =
  asyncHandler(
    async (req, res, next) => {
      const hashedToken =
        crypto
          .createHash('sha256')
          .update(req.params.token)
          .digest('hex');

      const user =
        await User.findOne({
          resetPasswordToken:
            hashedToken,

          resetPasswordExpire: {
            $gt: Date.now(),
          },
        });

      if (!user) {
        return next(
          new AppError(
            'Invalid or expired token',
            400
          )
        );
      }

      user.password =
        req.body.password;

      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpire =
        undefined;

      await user.save();

      // ==================================================
      // LOGIN AFTER PASSWORD RESET
      // ==================================================

      const {
        token: refreshToken,
        expiresAt,
      } = await generateRefreshToken(
        user._id,
        req
      );

      setRefreshTokenCookie(
        res,
        refreshToken,
        expiresAt
      );

      const accessToken =
        generateAccessToken(
          user._id
        );

      setAccessTokenCookie(
        res,
        accessToken
      );

      res.status(200).json({
        success: true,
        token: accessToken,
      });
    }
  );

// ======================================================
// GET CURRENT USER
// ======================================================
//
// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
//
// ======================================================

exports.getMe = asyncHandler(
  async (req, res, next) => {
    if (!req.user || !req.user._id) {
      return next(
        new AppError(
          'Not authorized',
          401
        )
      );
    }

    const user =
      await User.findById(
        req.user._id
      ).select('-password');

    if (!user) {
      return next(
        new AppError(
          'User not found',
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// ======================================================
// APPROVE USER
// ======================================================
//
// @desc    Approve user
// @route   PUT /api/auth/approve/:id
// @access  Private/Admin
//
// ======================================================

exports.approveUser =
  asyncHandler(
    async (req, res, next) => {
      const {
        cooperativeId,
      } = req.body;

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return next(
          new AppError(
            'User not found',
            404
          )
        );
      }

      user.cooperativeId =
        cooperativeId;

      user.status =
        'active';

      user.isVerified =
        true;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          'User approved successfully',
        user,
      });
    }
  );


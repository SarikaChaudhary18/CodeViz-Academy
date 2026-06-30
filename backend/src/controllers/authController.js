const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = require('../config/logger');

// Generate JWT Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all details.' });
    }

    // Check for existing user (uses index)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    logger.info(`User registered successfully: ${username}`);

    const token = generateAccessToken(newUser);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        xp: newUser.xp,
        level: newUser.level,
        streak: newUser.streak,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
    }

    // Uses index
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials.' });
    }

    // Check/Update streaks based on active date
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        user.streak += 1;
      } else if (user.lastActiveDate !== today) {
        user.streak = 1;
      }
      user.lastActiveDate = today;
      await user.save();
    }

    logger.info(`User logged in successfully: ${user.username}`);

    const token = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        targetRole: user.targetRole,
        codingProfiles: user.codingProfiles,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { email, username, credential } = req.body;
    let emailAddress = email;
    let nameVal = username;

    // Real Google OAuth verification if credential is passed
    if (credential) {
      logger.info('Google Auth: Verifying ID token with Google APIs...');
      try {
        const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.data && verifyRes.data.email) {
          emailAddress = verifyRes.data.email;
          nameVal = verifyRes.data.name || verifyRes.data.given_name || emailAddress.split('@')[0];
          logger.info(`Google token verified successfully for email: ${emailAddress}`);
        } else {
          return res.status(401).json({ status: 'fail', message: 'Google authentication failed: Invalid token payload.' });
        }
      } catch (err) {
        const errMsg = err.response && err.response.data && err.response.data.error_description
          ? err.response.data.error_description
          : err.message;
        logger.error(`Google token verification failed: ${errMsg}`);
        return res.status(401).json({ status: 'fail', message: `Google token verification failed: ${errMsg}` });
      }
    }

    if (!emailAddress) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email address or Google credential.' });
    }

    let user = await User.findOne({ email: emailAddress });

    if (!user) {
      // User doesn't exist, create a new profile (Google Signup)
      const generatedUsername = nameVal || emailAddress.split('@')[0] + Math.floor(Math.random() * 1000);
      const randomPassword = Math.random().toString(36).slice(-12);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        username: generatedUsername,
        email: emailAddress,
        password: hashedPassword,
      });

      logger.info(`User registered via Google Sign-up: ${user.username}`);
    } else {
      logger.info(`User logged in via Google Sign-in: ${user.username}`);
    }

    // Check/Update streaks based on active date
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastActiveDate = today;
      await user.save();
    }

    const token = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        targetRole: user.targetRole,
        codingProfiles: user.codingProfiles,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.passwordlessAuth = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // User doesn't exist, create a new profile (Auto-registration on first login)
      const generatedUsername = email.split('@')[0] + Math.floor(Math.random() * 1000);
      const randomPassword = Math.random().toString(36).slice(-12);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        username: generatedUsername,
        email,
        password: hashedPassword,
      });

      logger.info(`User registered via Passwordless Sign-up: ${user.username}`);
    } else {
      logger.info(`User logged in via Passwordless Sign-in: ${user.username}`);
    }

    // Check/Update streaks based on active date
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastActiveDate = today;
      await user.save();
    }

    const token = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        targetRole: user.targetRole,
        codingProfiles: user.codingProfiles,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    res.status(200).json({
      status: 'success',
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { targetRole, targetCompany, codingProfiles, apifyKey, bio, github } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    if (targetRole) user.targetRole = targetRole;
    if (targetCompany) user.targetCompany = targetCompany;
    if (apifyKey) user.apifyKey = apifyKey;
    if (bio !== undefined) user.bio = bio;
    if (github !== undefined) user.github = github;
    if (codingProfiles) {
      user.codingProfiles = { ...user.codingProfiles, ...codingProfiles };
    }

    await user.save();
    logger.info(`User profile updated: ${user.username}`);

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetCompany: user.targetCompany,
        targetRole: user.targetRole,
        codingProfiles: user.codingProfiles,
        bio: user.bio,
        github: user.github,
        connections: user.connections,
        connectionRequests: user.connectionRequests,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    // Queries using index on xp and level
    const users = await User.find({})
      .select('username level xp streak targetRole')
      .sort({ xp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      data: users,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    next(err);
  }
};

exports.getPeers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ status: 'fail', message: 'Current user not found.' });
    }

    // Retrieve all other users
    const allUsers = await User.find({ _id: { $ne: currentUser._id } })
      .select('username streak targetRole targetCompany bio github connections connectionRequests level xp');

    const peers = allUsers.map(peer => {
      // Calculate connection status
      let connectionStatus = 'not_connected';

      if (currentUser.connections.includes(peer._id)) {
        connectionStatus = 'connected';
      } else if (peer.connectionRequests.some(req => req.from.toString() === currentUser._id.toString() && req.status === 'pending')) {
        connectionStatus = 'request_sent';
      } else if (currentUser.connectionRequests.some(req => req.from.toString() === peer._id.toString() && req.status === 'pending')) {
        connectionStatus = 'request_received';
      }

      // Calculate matching metrics
      let matchScore = 40;
      if (peer.targetCompany && currentUser.targetCompany && peer.targetCompany.toLowerCase() === currentUser.targetCompany.toLowerCase()) {
        matchScore += 30;
      }
      if (peer.targetRole && currentUser.targetRole && peer.targetRole.toLowerCase() === currentUser.targetRole.toLowerCase()) {
        matchScore += 20;
      }
      const streakDiff = Math.abs((peer.streak || 0) - (currentUser.streak || 0));
      matchScore += Math.max(0, 10 - streakDiff);

      return {
        id: peer._id,
        name: peer.username,
        targetRole: peer.targetRole || 'Software Engineer',
        targetCompany: peer.targetCompany || 'Google',
        streak: peer.streak || 0,
        bio: peer.bio || '',
        github: peer.github || '',
        connectionStatus,
        matchScore: Math.min(100, matchScore),
        level: peer.level || 1,
        xp: peer.xp || 0
      };
    });

    res.status(200).json({
      status: 'success',
      data: peers
    });
  } catch (err) {
    next(err);
  }
};

exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ status: 'fail', message: 'You cannot connect with yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ status: 'fail', message: 'Target user not found.' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already connected
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(400).json({ status: 'fail', message: 'You are already connected.' });
    }

    // Check if request already exists from current user to target user
    const existingRequest = targetUser.connectionRequests.find(
      r => r.from.toString() === currentUserId && r.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ status: 'fail', message: 'Connection request already sent.' });
    }

    // Push connection request to target user
    targetUser.connectionRequests.push({ from: currentUserId, status: 'pending' });
    await targetUser.save();

    logger.info(`Connection request sent from ${currentUser.username} to ${targetUser.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Connection request sent successfully.'
    });
  } catch (err) {
    next(err);
  }
};

exports.acceptConnectionRequest = async (req, res, next) => {
  try {
    const senderId = req.params.senderId;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!senderUser) {
      return res.status(404).json({ status: 'fail', message: 'Sender user not found.' });
    }

    // Find if request exists
    const requestIndex = currentUser.connectionRequests.findIndex(
      r => r.from.toString() === senderId && r.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(400).json({ status: 'fail', message: 'No pending request from this user.' });
    }

    // Remove from connectionRequests
    currentUser.connectionRequests.splice(requestIndex, 1);

    // Add to connections for both users
    if (!currentUser.connections.includes(senderId)) {
      currentUser.connections.push(senderId);
    }
    if (!senderUser.connections.includes(currentUserId)) {
      senderUser.connections.push(currentUserId);
    }

    await currentUser.save();
    await senderUser.save();

    logger.info(`Connection request accepted: ${currentUser.username} and ${senderUser.username} are now connected.`);

    res.status(200).json({
      status: 'success',
      message: 'Connection request accepted.',
      user: {
        id: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        xp: currentUser.xp,
        level: currentUser.level,
        streak: currentUser.streak,
        targetCompany: currentUser.targetCompany,
        targetRole: currentUser.targetRole,
        codingProfiles: currentUser.codingProfiles,
        bio: currentUser.bio,
        github: currentUser.github,
        connections: currentUser.connections,
        connectionRequests: currentUser.connectionRequests,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectConnectionRequest = async (req, res, next) => {
  try {
    const senderId = req.params.senderId;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);

    // Find if request exists
    const requestIndex = currentUser.connectionRequests.findIndex(
      r => r.from.toString() === senderId && r.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(400).json({ status: 'fail', message: 'No pending request from this user.' });
    }

    // Remove from connectionRequests
    currentUser.connectionRequests.splice(requestIndex, 1);
    await currentUser.save();

    logger.info(`Connection request from ${senderId} rejected by ${currentUser.username}`);

    res.status(200).json({
      status: 'success',
      message: 'Connection request rejected.',
      user: {
        id: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        xp: currentUser.xp,
        level: currentUser.level,
        streak: currentUser.streak,
        targetCompany: currentUser.targetCompany,
        targetRole: currentUser.targetRole,
        codingProfiles: currentUser.codingProfiles,
        bio: currentUser.bio,
        github: currentUser.github,
        connections: currentUser.connections,
        connectionRequests: currentUser.connectionRequests,
      }
    });
  } catch (err) {
    next(err);
  }
};

const Community = require('../models/Community');
const Message = require('../models/Message');
const logger = require('../config/logger');

exports.createCommunity = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'fail', message: 'Community name is required.' });
    }

    const existingRoom = await Community.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ status: 'fail', message: 'A community with this name already exists.' });
    }

    const room = await Community.create({
      name,
      description,
      category,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    logger.info(`Community created: ${name} by ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: room
    });
  } catch (err) {
    next(err);
  }
};

exports.joinCommunity = async (req, res, next) => {
  try {
    const room = await Community.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ status: 'fail', message: 'Community not found.' });
    }

    if (room.members.includes(req.user.id)) {
      return res.status(400).json({ status: 'fail', message: 'You are already a member of this community.' });
    }

    room.members.push(req.user.id);
    await room.save();

    logger.info(`User ${req.user.username} joined community: ${room.name}`);

    res.status(200).json({
      status: 'success',
      message: `Successfully joined ${room.name}`,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

exports.getCommunities = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const rooms = await Community.find(filter)
      .populate('createdBy', 'username level')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

exports.getMessageHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = parseInt(req.query.page, 10) || 1;
    const { id: communityId } = req.params;

    // Queries using compound index { communityId: 1, createdAt: -1 }
    const messages = await Message.find({ communityId })
      .populate('senderId', 'username level')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: messages.reverse(), // Send in chronological order
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
};

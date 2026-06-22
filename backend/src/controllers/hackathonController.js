const Hackathon = require('../models/Hackathon');

exports.getHackathons = async (req, res, next) => {
  try {
    // Retrieve all active hackathons where end date is in the future
    const hackathons = await Hackathon.find({
      endDate: { $gte: new Date() }
    }).sort({ startDate: 1 });

    res.status(200).json({
      status: 'success',
      count: hackathons.length,
      data: hackathons
    });
  } catch (err) {
    next(err);
  }
};


const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const logger = require('../config/logger');
const axios = require('axios');

exports.getHackathons = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const apifyKey = (user && user.apifyKey) || process.env.APIFY_API_KEY;

    let hackathons = [];

    if (apifyKey) {
      try {
        // Mocking Apify Actor execution and fetch for upcoming hackathons
        // In real execution: trigger actor, wait for run to finish, fetch dataset items
        // Actor default ID for Devpost scrapers: "apify/devpost-scraper"
        logger.info(`Fetching hackathons using Apify key for user: ${req.user.username}`);
        const response = await axios.get(
          `https://api.apify.com/v2/actor-tasks/devpost-scraper/runs/last/dataset/items?token=${apifyKey}`,
          { timeout: 5000 }
        );
        if (Array.isArray(response.data) && response.data.length > 0) {
          hackathons = response.data.map(item => ({
            title: item.title || 'Tech Hackathon',
            host: item.organization || 'Devpost Partner',
            url: item.url || 'https://devpost.com',
            startDate: new Date(item.startDate || Date.now()),
            endDate: new Date(item.endDate || Date.now() + 86400000 * 3),
            tags: item.themes || ['Coding'],
          }));
        }
      } catch (err) {
        logger.warn(`Apify actor fetch failed, falling back to local database entries: ${err.message}`);
      }
    }

    // Fallback if Apify didn't fetch items: query database, or return mock defaults
    if (hackathons.length === 0) {
      hackathons = await Hackathon.find({ endDate: { $gte: new Date() } }).sort({ startDate: 1 });
    }

    if (hackathons.length === 0) {
      // Seed fallback values
      hackathons = [
        {
          title: 'Global AI Innovators Challenge',
          host: 'HackerEarth & Google',
          url: 'https://hackerearth.com/challenges',
          startDate: new Date(Date.now() + 86400000 * 5),
          endDate: new Date(Date.now() + 86400000 * 8),
          tags: ['AI/ML', 'Python', 'Google Cloud'],
        },
        {
          title: 'National Coding League 2026',
          host: 'Unstop Hackathons',
          url: 'https://unstop.com',
          startDate: new Date(Date.now() + 86400000 * 12),
          endDate: new Date(Date.now() + 86400000 * 14),
          tags: ['DSA', 'Web Development', 'Clustering'],
        },
        {
          title: 'Vite & Tailwind Hackfest',
          host: 'Tailwind Community',
          url: 'https://devpost.com',
          startDate: new Date(Date.now() + 86400000 * 20),
          endDate: new Date(Date.now() + 86400000 * 23),
          tags: ['React', 'Vite', 'Tailwind v4'],
        }
      ];
    }

    res.status(200).json({
      status: 'success',
      count: hackathons.length,
      data: hackathons
    });
  } catch (err) {
    next(err);
  }
};

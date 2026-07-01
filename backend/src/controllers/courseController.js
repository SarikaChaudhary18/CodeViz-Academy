const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');
const logger = require('../config/logger');
const { fetchPlaylistAsCourse } = require('../utils/youtubeService');

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({});
    
    // For each course, fetch the progress for the current logged-in user if it exists
    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
      const progress = await CourseProgress.findOne({
        userId: req.user.id,
        courseId: course._id
      });
      return {
        ...course.toObject(),
        progress: progress ? progress.progressPercent : 0,
        watchedVideos: progress ? progress.watchedVideos : []
      };
    }));

    res.status(200).json({
      status: 'success',
      data: coursesWithProgress
    });
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    const progress = await CourseProgress.findOne({
      userId: req.user.id,
      courseId: course._id
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...course.toObject(),
        progress: progress ? progress.progressPercent : 0,
        watchedVideos: progress ? progress.watchedVideos : []
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.trackVideoProgress = async (req, res, next) => {
  try {
    const { videoId } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id;

    if (!videoId) {
      return res.status(400).json({ status: 'fail', message: 'Video ID is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }

    // Verify video belongs to course
    const videoExists = course.videos.some(v => v.videoId === videoId);
    if (!videoExists) {
      return res.status(400).json({ status: 'fail', message: 'Video does not belong to this course.' });
    }

    let progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        watchedVideos: [],
        progressPercent: 0
      });
    }

    const alreadyWatched = progress.watchedVideos.includes(videoId);
    let xpGained = 0;

    if (!alreadyWatched) {
      progress.watchedVideos.push(videoId);
      progress.progressPercent = Math.round((progress.watchedVideos.length / course.videos.length) * 100);
      await progress.save();

      // Award XP
      xpGained = 50;
      const user = await User.findById(userId);
      if (user) {
        user.xp += xpGained;
        user.level = Math.floor(user.xp / 1000) + 1;
        await user.save();
      }

      logger.info(`User ${userId} watched video ${videoId} of course ${courseId}. Progress: ${progress.progressPercent}%`);
    }

    res.status(200).json({
      status: 'success',
      data: progress,
      xpGained
    });
  } catch (err) {
    next(err);
  }
};

// ── Import course from YouTube playlist URL ────────────────────────────────────
exports.importFromYoutube = async (req, res, next) => {
  try {
    const { url, title, category, difficulty, instructor, description } = req.body;
    if (!url) return res.status(400).json({ status: 'fail', message: 'YouTube URL is required.' });

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return res.status(500).json({ status: 'fail', message: 'YouTube API key not configured.' });

    const overrides = {};
    if (title)       overrides.title = title;
    if (category)    overrides.category = category;
    if (difficulty)  overrides.difficulty = difficulty;
    if (instructor)  overrides.instructor = instructor;
    if (description) overrides.description = description;

    logger.info(`Importing YouTube course from: ${url}`);
    const courseData = await fetchPlaylistAsCourse(url, apiKey, overrides);

    // Upsert: if same playlistId exists, update it; otherwise create new
    const course = await Course.findOneAndUpdate(
      { $or: [{ playlistId: courseData.playlistId }, { title: courseData.title }] },
      courseData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info(`Course imported: "${course.title}" with ${course.videos.length} videos`);
    res.status(201).json({ status: 'success', data: course });
  } catch (err) {
    logger.error(`YouTube import failed: ${err.message}`);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ── Preview playlist before importing (no DB write) ────────────────────────────
exports.previewYoutube = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: 'fail', message: 'URL is required.' });

    const apiKey = process.env.YOUTUBE_API_KEY;
    const courseData = await fetchPlaylistAsCourse(url, apiKey, {});

    // Return preview (no videos array, just metadata)
    const { videos, ...preview } = courseData;
    res.status(200).json({ status: 'success', data: { ...preview, videoCount: videos.length, sampleVideos: videos.slice(0, 5) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

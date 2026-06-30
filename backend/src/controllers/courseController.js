const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');
const logger = require('../config/logger');

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

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, Play, GraduationCap, ChevronLeft, Award, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [xpReward, setXpReward] = useState(null);

  const categories = ['All', 'DSA', 'Frontend', 'Development', 'Systems'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      if (res.status === 'success' || Array.isArray(res.data)) {
        setCourses(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${course._id}`);
      if (res.status === 'success' || res.data) {
        const fullCourse = res.data;
        setActiveCourse(fullCourse);
        if (fullCourse.videos && fullCourse.videos.length > 0) {
          // Default to first video or first unwatched video
          const unwatched = fullCourse.videos.find(v => !fullCourse.watchedVideos.includes(v.videoId));
          setActiveVideo(unwatched || fullCourse.videos[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch course detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!activeCourse || !activeVideo || trackingLoading) return;
    setTrackingLoading(true);
    setXpReward(null);
    try {
      const res = await api.post(`/courses/${activeCourse._id}/track`, {
        videoId: activeVideo.videoId
      });
      if (res.status === 'success' || res.data) {
        // Refetch active course detail to update progress percentages and checkmarks
        const detailRes = await api.get(`/courses/${activeCourse._id}`);
        if (detailRes.status === 'success' || detailRes.data) {
          setActiveCourse(detailRes.data);
        }
        if (res.xpGained) {
          setXpReward(`+${res.xpGained} XP Earned!`);
          setTimeout(() => setXpReward(null), 4000);
        }
        // Refetch full catalog in background
        fetchCourses();
      }
    } catch (err) {
      console.error('Failed to track video progress:', err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (activeCourse) {
    const watchedSet = new Set(activeCourse.watchedVideos || []);

    return (
      <div className="space-y-6 max-w-6xl mx-auto text-left">
        {/* Back navigation header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
          <button 
            onClick={() => {
              setActiveCourse(null);
              setActiveVideo(null);
              setXpReward(null);
            }}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase"
          >
            <ChevronLeft size={14} /> Back to Catalog
          </button>

          {xpReward && (
            <div className="bg-orange-500 text-white px-3 py-1 text-[10px] font-bold font-mono rounded-full animate-bounce">
              {xpReward}
            </div>
          )}
        </div>

        {/* Dynamic Course Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* YouTube Video Player Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-250 shadow-md relative">
              {activeVideo ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`}
                  title={activeVideo.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                  No video selected
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider">Now Playing</span>
                <h2 className="text-base font-extrabold text-zinc-950 leading-tight">
                  {activeVideo?.title || 'Course Lesson'}
                </h2>
              </div>

              {activeVideo && (
                <button
                  onClick={handleMarkCompleted}
                  disabled={watchedSet.has(activeVideo.videoId) || trackingLoading}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
                    watchedSet.has(activeVideo.videoId)
                      ? 'bg-green-550 text-green-700 bg-green-50 border border-green-200 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer'
                  }`}
                >
                  {watchedSet.has(activeVideo.videoId) ? (
                    <>
                      <CheckCircle size={14} /> Completed
                    </>
                  ) : trackingLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      Mark Completed
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Course Description */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest">Syllabus Overview</h4>
              <p className="text-xs text-zinc-650 leading-relaxed">
                {activeCourse.description}
              </p>
            </div>
          </div>

          {/* Playlist Side Menu Column */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
            <div>
              <h3 className="text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider pb-3 border-b border-zinc-150">
                Course Syllabus
              </h3>
              {/* Progress metrics */}
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-500">Progress</span>
                  <span className="font-bold text-orange-600">{activeCourse.progress}%</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-600 h-full transition-all duration-300" style={{ width: `${activeCourse.progress}%` }} />
                </div>
              </div>
            </div>

            {/* Videos List */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
              {activeCourse.videos?.map((video, index) => {
                const isWatched = watchedSet.has(video.videoId);
                const isActive = activeVideo?.videoId === video.videoId;

                return (
                  <button
                    key={video.videoId}
                    onClick={() => setActiveVideo(video)}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center gap-3 transition-all ${
                      isActive 
                        ? 'border-orange-500 bg-orange-50/20' 
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-zinc-400 font-bold">Lesson {index + 1}</span>
                        {isWatched && <CheckCircle size={10} className="text-green-600" />}
                      </div>
                      <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-orange-600' : 'text-zinc-900'}`}>
                        {video.title}
                      </h4>
                    </div>

                    <span className="text-[9px] font-mono text-zinc-400 shrink-0 font-bold uppercase">{video.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <GraduationCap className="text-orange-600 w-8 h-8" />
            LEARNING COURSES
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Build production skills with interactive YouTube playlists and video tracking
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Earn verified placement badges</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-mono text-xs animate-pulse">
          <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto mb-3" />
          Loading course catalog datasets...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 hover:border-orange-300 flex flex-col hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              {course.thumbnail ? (
                <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 bg-orange-600 text-[9px] font-bold text-white font-mono rounded">{course.category}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                      course.difficulty === 'Hard' ? 'bg-red-600 text-white' :
                      course.difficulty === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'
                    }`}>{course.difficulty}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                    {course.lessonsCount} lessons
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center px-5 pt-5">
                  <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-[9px] font-bold text-orange-600 font-mono rounded">{course.category}</span>
                  <span className={`text-[9px] font-mono font-bold uppercase ${
                    course.difficulty === 'Hard' ? 'text-red-500' :
                    course.difficulty === 'Medium' ? 'text-amber-600' : 'text-green-600'
                  }`}>{course.difficulty}</span>
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">

                {/* Title & Info */}
                <h3 className="text-base font-extrabold text-zinc-950 tracking-tight mb-1.5 hover:text-orange-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="text-[10px] text-zinc-500 font-mono mb-4">
                  Instructor: <span className="font-bold text-zinc-700">{course.instructor}</span>
                </div>
              </div>

              {/* Progress & Bottom Bar */}
              <div className="space-y-4 pt-4 px-5 pb-5 border-t border-zinc-100">
                {course.progress > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500">Progress</span>
                      <span className="font-bold text-orange-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-orange-600 h-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-500 font-mono">Not started yet</div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessonsCount} lessons</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                  </div>

                  <button 
                    onClick={() => handleSelectCourse(course)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {course.progress > 0 ? 'Resume' : 'Start'} <Play size={10} className="fill-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs">
              No courses found matching the active search parameters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

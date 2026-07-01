/**
 * seedYoutubeCourses.js
 * Run: node src/utils/seedYoutubeCourses.js
 * Fetches all YouTube playlists and upserts them into MongoDB.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { fetchPlaylistAsCourse } = require('./youtubeService');
const Course = require('../models/Course');

const API_KEY = process.env.YOUTUBE_API_KEY;

// ── All 12 courses to import ──────────────────────────────────────────────────
const COURSES = [
  {
    url: 'https://youtu.be/Z2oxGj36vZk?si=1508jyoSV6SGjDxO',
    overrides: {
      title: 'C++ Full Course',
      category: 'Systems',
      difficulty: 'Medium',
      instructor: 'CodeWithHarry',
      description: 'Complete C++ programming course from basics to advanced concepts including OOPs, STL, and memory management.',
    },
  },
  {
    url: 'https://youtu.be/JeYx8vJB75Q?si=iz8KHFRFz2o7Q6uP',
    overrides: {
      title: 'Object Oriented Programming (OOPs)',
      category: 'Systems',
      difficulty: 'Medium',
      instructor: 'Apna College',
      description: 'Learn Object-Oriented Programming concepts: classes, inheritance, polymorphism, abstraction, and encapsulation with practical examples.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&si=fLB_tJYuN9Rve3-x',
    overrides: {
      title: 'Data Structures & Algorithms — Complete',
      category: 'DSA',
      difficulty: 'Hard',
      instructor: 'Striver (TakeUforward)',
      description: 'The most comprehensive DSA course covering arrays, linked lists, trees, graphs, DP, and every important topic for placements.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLPe9IkX86X3y5m_MvtNu2ughxsvkqUNKr&si=qFAE4g9LAPnuE38-',
    overrides: {
      title: 'NeetCode 150 — Company-wise DSA',
      category: 'DSA',
      difficulty: 'Hard',
      instructor: 'NeetCode',
      description: 'Solve the famous NeetCode 150 problems organized by pattern and company. Best for FAANG interview preparation.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLinedj3B30sDZ17Fpe3xGUDRBkutaGyUp&si=qWOEiFAgllvHnu0m',
    overrides: {
      title: 'AWS — Amazon Web Services Full Course',
      category: 'Development',
      difficulty: 'Medium',
      instructor: 'AWS Training',
      description: 'Learn AWS cloud computing: EC2, S3, Lambda, RDS, IAM, VPC and more. Prepare for the AWS Solutions Architect certification.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLbtI3_MArDOk_A-GnYHPOiHSxlK2Vd3Zn&si=DlwbJ_rjfa1llG_r',
    overrides: {
      title: 'MERN Stack — Advanced Full Course',
      category: 'Frontend',
      difficulty: 'Hard',
      instructor: 'Piyush Garg',
      description: 'Build production-grade full-stack applications with MongoDB, Express, React and Node.js. Covers auth, deployment, and best practices.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w&si=uUIMhBmvc7bT1Fs1',
    overrides: {
      title: 'MERN Stack for Beginners',
      category: 'Frontend',
      difficulty: 'Easy',
      instructor: 'CodeWithHarry',
      description: 'Start your full-stack journey with this beginner-friendly MERN stack course. Build projects from scratch with step-by-step guidance.',
    },
  },
  {
    url: 'https://youtu.be/4qyBjxPlEZo?si=8mMfbsWoBumznMOV',
    overrides: {
      title: 'MERN Stack Project — Full Build',
      category: 'Frontend',
      difficulty: 'Hard',
      instructor: 'JavaScript Mastery',
      description: 'Build a real-world full-stack MERN project from scratch. Learn how to structure, build and deploy a production-ready application.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX&si=ruh_AsFMUjP9pTvc',
    overrides: {
      title: 'System Design — Complete Course',
      category: 'Systems',
      difficulty: 'Hard',
      instructor: 'Gaurav Sen',
      description: 'Learn system design from scratch: scalability, load balancing, databases, caching, microservices, and designing large-scale systems.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLrtCHHeadkHp92TyPt1Fj452_VGLipJnL&si=bfZLM3ilFm0FDLHA',
    overrides: {
      title: 'System Design — Interview Preparation',
      category: 'Systems',
      difficulty: 'Hard',
      instructor: 'Exponent',
      description: 'Company-wise system design interview questions. Learn how to design Twitter, YouTube, WhatsApp, Uber and other real-world systems.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLDzeHZWIZsTpukecmA2p5rhHM14bl2dHU&si=bzL1sYuj44F4mHEq',
    overrides: {
      title: 'DBMS — Database Management System',
      category: 'Systems',
      difficulty: 'Medium',
      instructor: 'CodeHelp by Babbar',
      description: 'Complete DBMS course: ER diagrams, normalization, SQL, transactions, ACID properties, and database design for placements and exams.',
    },
  },
  {
    url: 'https://youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_&si=-HoEg02OutQKnDVs',
    overrides: {
      title: 'Computer Networks — Full Course',
      category: 'Systems',
      difficulty: 'Medium',
      instructor: 'Gate Smashers',
      description: 'Comprehensive computer networks course: OSI model, TCP/IP, DNS, HTTP, routing, subnetting, and network protocols for interviews and exams.',
    },
  },
];

async function main() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL);
  console.log('✅ Connected\n');

  let success = 0, failed = 0;

  for (const { url, overrides } of COURSES) {
    const label = overrides.title;
    process.stdout.write(`⏳ Fetching: ${label} ...`);
    try {
      const courseData = await fetchPlaylistAsCourse(url, API_KEY, overrides);

      // Upsert by title to avoid duplicates on re-run
      await Course.findOneAndUpdate(
        { title: courseData.title },
        courseData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(` ✅ ${courseData.lessonsCount} videos, ${courseData.duration}`);
      success++;
    } catch (err) {
      console.log(` ❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done! ${success} imported, ${failed} failed.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});

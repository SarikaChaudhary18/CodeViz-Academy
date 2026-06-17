# StudyQuest OS - Gamified Study & AI Personalization Platform

StudyQuest is a gamified, AI-powered study dashboard designed to make learning immersive, social, and visual. This repository contains the project structure representing a Next.js (App Router), Tailwind CSS, and Framer Motion application.

---

## 📂 Folder Structure

```
studyquest/
├── public/                     # Static assets (images, icons, etc.)
└── src/
    ├── app/                    # Next.js App Router routing structure
    │   ├── api/                # Backend API routes (e.g., AI buddy endpoints)
    │   ├── dashboard/          # Nested dashboard page routes
    │   │   ├── analytics/      # Learning analytics dashboard page
    │   │   ├── focus/          # Focus mode distraction-free workspace
    │   │   ├── friends/        # Collaborative goals and friends interface
    │   │   ├── quests/         # Daily XP quests and progress logs
    │   │   ├── reports/        # Weekly performance reports
    │   │   ├── roadmap/        # AI Career Roadmap builder
    │   │   └── tree/           # RPG Skill Evolution Tree view
    │   ├── layout.tsx          # Global layout structure (with Sidebar & Navbar)
    │   └── page.tsx            # Main landing/login portal page
    ├── components/             # Reusable UI & Feature-specific React components
    │   ├── features/           # Components grouped by feature domain
    │   │   ├── analytics/      # Predictors, charts, and metrics
    │   │   ├── challenges/     # Adaptive difficulty quiz interfaces
    │   │   ├── evolution-tree/ # RPG Skill Tree (SVG/Canvas based Nodes)
    │   │   ├── focus-mode/     # Distraction-free timers and background music selector
    │   │   ├── friends/        # Group lobbies, chat panels, shared progression
    │   │   ├── heatmap/        # GitHub-style study activity calendar
    │   │   ├── quests/         # Daily quests lists and progress bars
    │   │   ├── reports/        # Weekly insights, hours studied, and radar charts
    │   │   ├── roadmap/        # Flow diagrams for Career Paths (Frontend, AI, etc.)
    │   │   ├── skill-dna/      # Radar chart UI showing Strengths & Weaknesses
    │   │   └── study-buddy/    # AI accountability chatbot interface
    │   ├── layout/             # Global layout components (Sidebar, Header)
    │   └── ui/                 # Shared visual primitive components (Buttons, Modals, Cards)
    ├── hooks/                  # Custom React hooks (e.g., useTimer, useXP)
    ├── lib/                    # Helper libraries, utilities, and API clients
    ├── styles/                 # Global styles, variables, Tailwind configurations
    └── types/                  # TypeScript interface definitions (User, Quest, Skill)
```

---

## 🚀 Feature Mapping Guide

Here is where each requested feature has its designated folder:

1. **Weekly Reports**  
   * **Location**: `src/components/features/reports/` and `src/app/dashboard/reports/`  
   * **Includes**: Hours studied, topics completed, problems solved, productivity score.  

2. **Skill Evolution Tree**  
   * **Location**: `src/components/features/evolution-tree/` and `src/app/dashboard/tree/`  
   * **Includes**: An RPG-style interactive node graph showing progression paths, unlocking skills, and leveling up.  

3. **Study Heatmap**  
   * **Location**: `src/components/features/heatmap/`  
   * **Includes**: A GitHub-style calendar grid tracking consecutive days studied, customizable color palettes (representing XP gained per day).  

4. **AI Career Roadmap**  
   * **Location**: `src/components/features/roadmap/` and `src/app/dashboard/roadmap/`  
   * **Includes**: Specialized interactive roadmap trees for roles like:
     * Frontend Developer
     * Full Stack Developer
     * AI Engineer
     * Data Scientist
     * Cyber Security Engineer
     * DevOps Engineer

5. **Focus Mode**  
   * **Location**: `src/components/features/focus-mode/` and `src/app/dashboard/focus/`  
   * **Includes**: Distraction-free full-screen environment, Pomodoro timers, ambient sound engines, and minimalist aesthetic.  

6. **AI Study Buddy**  
   * **Location**: `src/components/features/study-buddy/`  
   * **Includes**: Interfacable AI mentor/accountability partner that prompts user with study checks, schedules, and tips.  

7. **Adaptive Difficulty**  
   * **Location**: `src/components/features/challenges/`  
   * **Includes**: Interactive quiz widgets where the logic checks performance and escalates or de-escalates question difficulty.  

8. **Daily XP Quests**  
   * **Location**: `src/components/features/quests/` and `src/app/dashboard/quests/`  
   * **Includes**: Visual list of daily quests (e.g., "Solve 3 Algorithms", "Study 25 min") with reward multipliers.  

9. **Skill DNA**  
   * **Location**: `src/components/features/skill-dna/`  
   * **Includes**: Interactive radar/spider chart showing strengths (e.g., Frontend, Logic) and weaknesses.  

10. **Learning Analytics**  
    * **Location**: `src/components/features/analytics/` and `src/app/dashboard/analytics/`  
    * **Includes**: Smart graphs predicting course completion time, mastery scores, and recommendations.  

11. **Study with Friends**  
    * **Location**: `src/components/features/friends/` and `src/app/dashboard/friends/`  
    * **Includes**: Group dashboard showing online buddies, collaborative quests, and comparative leaderboard.  

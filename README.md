# ⚡ JEE MANTHAN PORTAL
<p align="center">
  <b>The Ultimate Preparation &amp; Productivity Suite for JEE Main &amp; JEE Advanced Aspirants</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Three.js-0.185-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/KaTeX-Math%20Engine-green?style=for-the-badge&logo=latex&logoColor=white" alt="KaTeX" />
  <img src="https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

## Overview
**JEE MANTHAN** is an all-in-one digital command center crafted specifically for competitive engineering entrance exam students. It combines real-time interactive 3D physics graphics, step-by-step problem breakdown tools, disciplined study countdowns, customizable target trackers, and community integration into one seamless, responsive web platform.

## Key Highlights &amp; Features

### ⚛️ 1. Interactive 3D Atomic Core
- Immersive Antigravity 3D atomic orbital model built with **Three.js** and **React Three Fiber**.
- Real-time particle physics, depth effects, and fluid rotation that respond seamlessly to user interaction.

### 🧠 2. Step-by-Step Doubt Solver
- Instant breakdown of complex Physics, Chemistry, and Mathematics questions.
- **KaTeX LaTeX Math Rendering**: Flawless mathematical equations, vectors, integration steps, and chemical structures.
- **Image Input Support**: Upload diagrams, circuit graphs, or printed book questions for direct explanation.
- **Auto-generated Visual Schematics**: Inline vector diagrams for free-body diagrams, circuits, and coordinate trajectories.
- **Doubt Management**: Session memory with quick-recall history and a one-click **"Clear All"** option.

### ⏱️ 3. JEE Study Pomodoro &amp; NTA Exam Timer
- Scientifically calibrated focus modes: **25-minute sprints**, **50-minute deep work**, and **3-hour full NTA mock simulations**.
- High-intensity audio alarm and vibration cues to keep exam preparation disciplined and strictly timed.

### 🎯 4. Daily Goals &amp; Streak Engine
- Subject-wise task management categorized by Physics, Chemistry, and Mathematics.
- Dynamic completion percentage analytics and continuous streak tracking to maintain daily momentum.

### 📊 5. Mock Test Performance &amp; Percentile Tracker
- Record mock exam scores across subjects.
- Visual charts and score logs to track historical accuracy and preparation trajectory over time.

### 🚀 6. High-Yield Revision Formula Sheets
- Curated reference cards for high-frequency formulas and essential concepts for fast revision before exams.

### 👥 7. Telegram Student Community
- Direct access to active peer discussion channels, announcements, and study groups.

### 🌓 8. Adaptive Light &amp; Dark Theme
- Seamless theme toggle for all study modules (Doubt Solver, Study Pomodoro, Daily Goals, Mock Tests, Community, Feedback, and Profile).
- Dedicated immersive cosmic dark visualizer for the 3D Atomic Core.

## Meet the Creators
Connect with the development team on Telegram:

| Creator | Telegram Handle | Link |
| :--- | :--- | :--- |
| **Silent Killer** | `@Immortality_on_Peak` | [Message on Telegram](http://t.me/Immortality_on_Peak) |
| **Saransh** | `@CallmeSrx` | [Message on Telegram](https://t.me/CallmeSrx) |
| **Blue Flash** | `@povego` | [Message on Telegram](https://t.me/povego) |

## Technology Stack
- **Frontend Core**: React 19, TypeScript, Vite
- **UI &amp; Styling**: Tailwind CSS 4, Framer Motion, Lucide Icons
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Scientific Typography**: KaTeX, `remark-math`, `rehype-katex`
- **Data Visualization**: Recharts
- **Backend &amp; API**: Express, Node.js

## Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/jee-manthan-portal.git
cd jee-manthan-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
```

## Deploying to Vercel
This repository is optimized for zero-configuration deployment on **Vercel**:
1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `jee-manthan-portal` repository.
4. **Environment Variables** (Project Settings > Environment Variables):
   - `GROQ_API_KEY`: Your API key from [Groq Console](https://console.groq.com/keys)
   - `GROQ_MODEL`: (Optional, defaults to `llama-3.3-70b-versatile`)
   - `GEMINI_API_KEY`: (Optional vision/fallback key)
5. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Vercel will automatically handle client-side routing (`vercel.json`) and API functions (`/api`).

## License
Distributed under the **MIT License**. Created with passion for students striving for excellence in JEE Main &amp; Advanced.

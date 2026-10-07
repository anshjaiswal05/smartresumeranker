# SMART RESUME RANKER 🚀
### Full-Stack AI-Powered Career Platform

Smart Resume Ranker is a comprehensive, production-grade web application built for students, freshers, and experienced software professionals. It provides deterministic ATS resume scoring, AI semantic analysis, prioritized skill-gap discovery, interactive learning roadmaps, a live 6-template resume builder, an AI mock interview simulator with non-repeating questions, personalized cover letter & recruiter outreach generators, and a curated tech job explorer for India tech hubs.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (No React, Next.js, Vue, Angular, or JSX)
- **Backend:** Node.js, Express.js
- **Authentication:** Firebase Authentication & Google Sign-In with backend token verification
- **Database:** Firebase Firestore (with automatic development fallback store)
- **AI Engine:** Official Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash`
- **File Storage:** **Zero permanent storage** — Resumes are processed in temporary memory/disk, parsed, scored, and immediately purged.

---

## 📂 Project Architecture

```text
Smart Resume Ranker 2.0/
│
├── frontend/
│   ├── index.html                  # Landing page
│   ├── login.html                  # Google Login with account check
│   ├── signup.html                 # Google Sign Up with duplicate prevention
│   ├── profile-setup.html          # First-time profile onboarding
│   ├── dashboard.html              # Career overview & metrics
│   ├── resume.html                 # Upload & ATS Scoring
│   ├── resume-builder.html         # Live Builder with 6 templates
│   ├── skill-gap.html              # Role search & priority skill gaps
│   ├── roadmap.html                # Learning roadmaps & progress tracking
│   ├── cover-letter.html           # Gemini-powered cover letter generator
│   ├── recruiter-outreach.html     # LinkedIn / Email / DM outreach generator
│   ├── mock-interview.html         # Technical interview simulator
│   ├── job-explorer.html           # India tech job explorer
│   ├── profile.html                # Account & structured resume viewer
│   ├── settings.html               # Theme preferences & account controls
│   │
│   ├── css/
│   │   ├── style.css               # Core layout, cards, buttons, badges
│   │   ├── responsive.css          # Mobile drawer & adaptive breakpoints
│   │   └── themes.css              # Light & Dark mode high-contrast CSS variables
│   │
│   └── js/
│       ├── firebase-config.js      # Firebase client initialization
│       ├── auth.js                 # Sign Up vs Login flows & auth guards
│       ├── navigation.js           # Shared sidebar & drawer controller
│       ├── api.js                  # Centralized fetch helper & toast alerts
│       ├── theme.js                # Theme switcher with localStorage persistence
│       ├── dashboard.js            # Dashboard statistics & activity feed
│       ├── resume.js               # Upload & ATS scoring renderer
│       ├── resume-builder.js       # Dynamic forms & live template preview
│       ├── skill-gap.js            # Role matching engine
│       ├── roadmap.js              # Roadmap curriculum & Firestore progress
│       ├── cover-letter.js         # Tailored cover letter generator
│       ├── recruiter.js            # Multi-channel outreach generator
│       ├── mock-interview.js       # Dynamic question stepper & AI evaluator
│       ├── jobs.js                 # Search, filters, and saved job bookmarks
│       └── profile.js              # Profile editor & extracted metrics
│
└── backend/
    ├── server.js                   # Express server entrypoint & static serving
    ├── package.json                # Dependencies & scripts
    ├── .env                        # Environment variables
    ├── .env.example                # Example configuration template
    │
    ├── config/
    │   └── firebase-admin.js       # Firebase Admin & fallback datastore
    │
    ├── middleware/
    │   ├── authMiddleware.js       # Firebase ID token verification
    │   ├── errorMiddleware.js      # Centralized error handler
    │   └── uploadMiddleware.js     # Multer temp upload with 10MB limit
    │
    ├── routes/
    │   ├── userRoutes.js           # Auth verification & profile routes
    │   ├── resumeRoutes.js         # Upload & ATS analysis routes
    │   ├── atsRoutes.js            # ATS status endpoints
    │   ├── resumeBuilderRoutes.js  # Resume builder save & load
    │   ├── skillRoutes.js          # Roles catalog & gap analysis
    │   ├── roadmapRoutes.js        # Curricula & progress tracking
    │   ├── aiRoutes.js             # Cover letter & recruiter outreach
    │   ├── coverLetterRoutes.js    # Dedicated cover letter route
    │   ├── recruiterRoutes.js      # Dedicated recruiter route
    │   ├── interviewRoutes.js      # Mock interview lifecycle
    │   ├── jobRoutes.js            # Job explorer & bookmark routes
    │   └── dashboardRoutes.js      # Aggregated metrics & activity
    │
    ├── controllers/
    │   ├── userController.js
    │   ├── resumeController.js
    │   ├── resumeBuilderController.js
    │   ├── skillController.js
    │   ├── roadmapController.js
    │   ├── aiController.js
    │   ├── interviewController.js
    │   ├── jobController.js
    │   └── dashboardController.js
    │
    ├── services/
    │   ├── atsService.js           # Deterministic parser & hybrid scoring
    │   ├── geminiService.js        # Google GenAI SDK integration
    │   ├── interviewService.js     # Non-repeating question bank & grading
    │   ├── jobService.js           # Verified tech jobs for India hubs
    │   ├── roadmapService.js       # Community-aligned role curricula
    │   └── skillService.js         # Comprehensive tech role skills dataset
    │
    ├── utils/
    │   └── fileParser.js           # PDF & DOCX extraction with auto-cleanup
    │
    └── tests/
        └── api_test.js             # Automated 20-point test suite
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup
Navigate into `backend/` and install dependencies:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Edit `backend/.env`:
```env
PORT=5000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key_here\n-----END PRIVATE KEY-----\n"

# Optional External Job / ATS Keys
ATS_API_KEY=
JOB_API_KEY=
```

*(Note: If Firebase credentials or the Gemini key are not supplied yet, the application gracefully operates in local development fallback mode with intelligent local persistence so you can test all features immediately!)*

### 3. Start the Server
```bash
node server.js
```
The server will start on `http://localhost:5000`.

### 4. Open in Browser
Open `http://localhost:5000` in any modern web browser.

---

## 🧪 Automated Testing
Run the complete end-to-end API test suite:
```bash
cd backend
node tests/api_test.js
```
Validates:
- Health check & static HTML serving
- Sign Up vs Login distinction & duplicate account rejection
- Profile management
- Deterministic & AI ATS scoring
- Temporary file extraction & immediate deletion
- Roles catalog & skill gap engine
- Curricula & progress tracking in Firestore
- AI Cover letter & outreach generators
- Non-repeating mock interview generation & answer grading
- Tech job explorer search & bookmarking
- Resume builder save & load
- Dashboard metrics aggregation

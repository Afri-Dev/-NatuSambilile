
# NatuSambilile - Let Us Learn

NatuSambilile is an interactive Learning Management System (LMS) designed to facilitate online education. It leverages the Google Gemini API for AI-powered content generation, allowing administrators and instructors to easily create engaging courses, modules, and lessons. Students can track their progress, complete lessons, and take quizzes.

## Core Features

*   **User Authentication & Roles:** Secure login and registration system with distinct roles (Admin, Instructor, Student) and permissions.
*   **Course Management (Admin/Instructor):**
    *   Create, Read, Update, and Delete (CRUD) courses.
    *   AI-assisted course description generation.
*   **Module Management (Admin/Instructor):**
    *   CRUD operations for modules within courses.
    *   AI-powered module title suggestions based on course content.
*   **Lesson Management (Admin/Instructor):**
    *   CRUD operations for lessons within modules.
    *   AI-assisted lesson content generation.
*   **Quiz Management (Admin/Instructor):**
    *   Create and manage quizzes within modules.
    *   Add various question types (Multiple Choice, True/False).
    *   Define points for questions and set correct answers.
*   **Student Experience:**
    *   View available courses and their content.
    *   Mark lessons as complete.
    *   Track progress at lesson, module, and course levels.
    *   Take quizzes and view results immediately.
*   **Responsive Design:** User interface adaptable to various screen sizes.
*   **Data Persistence (Current):** Uses browser `localStorage` for storing course data, user information, and progress (for demonstration and basic offline testing).

## Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (via CDN)
*   **Routing:** React Router DOM
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Icons:** Heroicons (via SVG components)
*   **Build/Setup:** Direct ES Module imports in `index.html` with an import map. No explicit bundler like Webpack/Vite/Parcel is pre-configured in the provided file structure.

## Database & Data Persistence

### Current Approach (for Demo & Offline Testing)

The application currently uses **browser `localStorage`** (via the `useLocalStorage` custom hook) for all data persistence.

*   **Advantages:**
    *   Simple to implement for a frontend-only application.
    *   Works offline by default as data is stored in the user's browser.
    *   Allows for quick prototyping and testing of application logic without needing a backend.
*   **Limitations for Production:**
    *   **Data Isolation:** Data is confined to the user's browser on a specific device. It cannot be shared across users or devices.
    *   **Limited Storage:** `localStorage` has relatively small storage limits (typically 5-10MB).
    *   **No Real-time Updates:** Changes made by one user won't reflect for others.
    *   **Security Concerns:** Storing sensitive data (even hashed passwords, which is not the case here for simplicity) in `localStorage` is not recommended. True secure authentication requires a backend.
    *   **No Central Management:** Data cannot be centrally managed, backed up, or analyzed.
    *   **Scalability:** Not suitable for a growing user base or large amounts of content.

### Production-Ready Database Solutions

For a production-ready version of NatuSambilile that supports multiple users, data sharing, and scalability, a **backend service connected to a dedicated database** is essential. Here are some recommended approaches:

1.  **Backend-as-a-Service (BaaS):**
    These platforms provide backend infrastructure, including databases, authentication, and more, often with client-side SDKs for easy integration.

    *   **Firebase (by Google):**
        *   **Database:** Firestore (NoSQL, document-based) or Realtime Database (NoSQL, JSON-based).
        *   **Features:** Authentication, hosting, cloud functions, real-time capabilities.
        *   **Offline Development:** Firebase Emulator Suite allows full local testing.
        *   **Online Deployment:** Scalable, hosted cloud service.

2.  **Custom Backend API + Database:**
    This involves building your own backend API to handle data logic and interact with a database of your choice.

    *   **Backend Technologies:** Node.js (with Express.js, NestJS), Python (Django, Flask), Ruby on Rails, etc.
    *   **Database Technologies:**
        *   **PostgreSQL:** Robust, open-source relational database.
        *   **MySQL:** Popular open-source relational database.
        *   **MongoDB:** Popular NoSQL document database.
    *   **Deployment with Vercel:**
        *   Your frontend (React app) can be deployed to Vercel.
        *   Your backend API can be deployed as Vercel Serverless Functions.
        *   **Vercel Storage:**
            *   **Vercel Postgres:** Fully managed, serverless PostgreSQL designed for Vercel.
            *   **Vercel KV:** Serverless Redis-compatible key-value store for caching or simpler data.
            *   **Vercel Blob:** For storing files like course images.
    *   **Offline Development:** Run your custom API and a local instance of your chosen database (e.g., via Docker) on your development machine.

### Necessary Steps for Database Integration:

1.  **Choose a Solution:** Select a BaaS or a custom backend + database stack.
2.  **Data Modeling/Schema Design:** Define the structure for your data (e.g., tables/collections for users, courses, modules, lessons, quizzes, questions, attempts, progress) including fields, types, and relationships.
3.  **Backend Development:**
    *   If custom backend: Develop API endpoints for all CRUD (Create, Read, Update, Delete) operations. Implement business logic and data validation.
    *   If BaaS: Set up your project, configure database rules/security, and familiarize yourself with their SDK.
4.  **Authentication:** Implement a secure authentication system.
5.  **Frontend Refactoring:**
    *   Replace `useLocalStorage` calls with API calls to your backend or BaaS SDK methods.
    *   Manage application state based on responses from the backend (loading states, error handling).
    *   Integrate the chosen authentication flow.
6.  **Environment Configuration:** Securely manage API keys, database connection strings, and other sensitive credentials using environment variables for both local development and production.

## Getting Started

### Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
*   A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the Repository (Example):**
    If this project were in a Git repository, you would clone it:
    ```bash
    git clone <repository-url>
    cd NatuSambilile
    ```
    For the current setup, ensure you have all the provided files (`index.html`, `index.tsx`, `App.tsx`, `types.ts`, `constants.tsx`, `metadata.json`, and all files in `components/`, `pages/`, `hooks/`, `services/`) in the correct directory structure.

2.  **Environment Variables (API Key):**
    The application requires a Google Gemini API key to power its AI features.
    *   Create a file named `.env` in the root of your project (if you were using a build system that supports it).
    *   Add your API key to this file:
        ```env
        API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   **Important for the current setup:** Since this project runs directly in the browser without a Node.js build process that typically handles `.env` files, `process.env.API_KEY` (as used in `services/geminiService.ts`) will not be automatically populated from a `.env` file during local development by just opening `index.html`.
        *   **For local testing of AI features:** You might need to temporarily hardcode the API key in `services/geminiService.ts` (NOT recommended for production or sharing) or use a local development server that can inject environment variables (e.g., Vite, Parcel, or a custom script).
        *   For deployment (e.g., to Vercel), you will set this environment variable in the hosting platform's settings.

3.  **Running Locally:**
    *   Open the `index.html` file directly in your web browser.
    *   Alternatively, serve the project directory using a simple HTTP server. If you have Node.js installed, you can use `npx serve .` from the project's root directory.

    By default, an `admin` user is created with credentials:
    *   Username: `admin`
    *   Password: `admin`

## Project Structure

The project is organized as follows:

```
.
├── README.md
├── index.html          # Main HTML entry point, includes Tailwind CSS setup and import map
├── index.tsx           # Main React application entry point
├── metadata.json       # Project metadata
├── App.tsx             # Root App component, context provider, routing
├── types.ts            # TypeScript type definitions
├── constants.tsx       # Shared constants and SVG icon components
├── hooks/
│   └── useLocalStorage.ts # Custom hook for local storage management
├── services/
│   └── geminiService.ts   # Service for interacting with the Gemini API
├── components/
│   ├── common/           # Reusable UI components (Navbar, Footer, Modal, etc.)
│   ├── forms/            # Form components for CRUD operations
│   └── CourseCard.tsx    # Component for displaying course cards
├── pages/
│   ├── HomePage.tsx      # Displays list of courses
│   ├── CoursePage.tsx    # Displays details of a single course (modules, lessons, quizzes)
│   └── LoginPage.tsx     # User login and registration page
└── (other potential assets or config files)
```

## Deployment to Vercel

Vercel is a great platform for deploying modern web applications. Here's how you can deploy NatuSambilile:

### 1. Prerequisites
*   A Vercel account (sign up at [vercel.com](https://vercel.com/)).
*   Git (if your project is not already in a Git repository, initialize one and push it to GitHub/GitLab/Bitbucket).

### 2. Deployment Steps
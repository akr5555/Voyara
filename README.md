<div align="center">

#  Voyara
## Your Intelligent, End-to-End Local Travel Companion

> *Experience the world your way. Plan the journey, not just the bookings.*

[![Live Demo](https://img.shields.io/badge/Live-voyara.onrender.com-blue?style=for-the-badge)](https://voyara.onrender.com)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger_UI-green?style=for-the-badge)](https://voyara.onrender.com/api-docs)
[![Mobile App](https://img.shields.io/badge/Mobile-Kotlin_KMP-purple?style=for-the-badge)](https://github.com/NitishChoubey/Voyara-Mobile-App-Platform)

</div>

---

##  The Vision

Travel planning is a fragmented, stressful mess of open tabs — flights here, hotels there, and generic "top 10 things to do" lists that offer no real local insight. Most platforms stop once the flight is booked.

**Voyara changes the paradigm.** We are an intelligent, interactive platform that acts as your **personal local tour guide** for unknown cities. Voyara is an **itinerary builder** that takes users from an initial travel idea to a **fully structured, day-wise, budgeted, and actionable itinerary**, surfacing local activities and meaningful experiences in a single planning flow.


## Problem Statement

Travel planning today is highly fragmented. Users depend on multiple platforms for:
- Flights and transport  
- Accommodation  
- Local attractions and activities  
- Budget planning  
- Daily scheduling  

This results in disorganized plans, no clear day-wise execution, poor budget visibility, and generic tourist experiences. Most platforms stop at bookings and fail to support the **actual travel experience**.


## Proposed Solution

Voyara provides an end-to-end **itinerary building platform** that converts scattered travel ideas into a single visual and structured journey.

Voyara enables users to:
- Plan trips day-by-day using an interactive timeline  
- Discover local experiences instead of generic tourist lists  
- Track time and budget together  
- Receive intelligent AI assistance while staying in full control  

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ 
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/NitishChoubey/Voyara_FSD.git
cd Voyara_FSD

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your Supabase credentials and Vega AI URL
```

### Running Locally

```bash
# Start the frontend dev server (hot-reload)
npm run dev
# → Opens at http://localhost:8080
##  Live Demo && Resources

# In a separate terminal, start the backend API server
npm run server
# → API at http://localhost:10000
# → Swagger UI at http://localhost:10000/api-docs
```

### Production Build

```bash
npm run build    # Build the React frontend
npm start        # Serve frontend + API from a single Express server
```

### Environment Variables
###  Technical Documentation
Detailed system documentation is organized inside the repository:
- **[Docs Folder](./docs/)**
  - **[Flowchart Explanation](./docs/FLOWCHART.md)**
  - **[Wireframes & DFDs](./docs/WIREFRAME_AND_DFD.md)**
- **[Assets Folder](./assets/)**
  - Flowcharts
  - Data Flow Diagrams (DFDs)
  - Database Schema
  - UI Wireframes

See [`.env.example`](./.env.example) for all required variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_VEGA_AI_URL` | URL of the Vega AI FastAPI service |
| `PORT` | Express server port (default: `10000`) |

---

## 📁 Project Structure

```
Voyara_FSD/
├── public/                  # Static assets (favicon, logo, loading screen)
├── server/                  # Express.js backend
│   ├── index.js             # API routes (auth, trips, destinations, profile)
│   ├── supabase.js          # Supabase client for server-side
│   └── swagger.js           # Swagger/OpenAPI configuration
├── src/                     # React frontend (Vite + TypeScript)
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Site footer
│   │   ├── HeroSlider.tsx   # Landing page hero carousel
│   │   ├── VegaAI.tsx       # Vega AI chat assistant
│   │   └── ProtectedRoute.tsx  # Auth route guard
│   ├── contexts/            # React context providers
│   │   └── AuthContext.tsx   # Centralized auth state
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Supabase client & types
│   ├── pages/               # Route-level page components
│   │   ├── Index.tsx        # Landing / Home page
│   │   ├── Auth.tsx         # Login & Signup
│   │   ├── CreateTrip.tsx   # New trip creation form
│   │   ├── MyTrips.tsx      # Trip listing dashboard
│   │   ├── TripDetails.tsx  # Single trip view
│   │   ├── DayPlanner.tsx   # Day-wise itinerary planner + Vega AI
│   │   └── Profile.tsx      # User profile & settings
│   └── lib/                 # Utility functions
├── supabase/                # Supabase migrations
├── docs/                    # Flowcharts, wireframes, DFDs
├── assets/                  # Design assets & demo video
└── render.yaml              # Render deployment config
```

---

## 🎥 Demo & Resources

- **[Live Web App →](https://voyara.onrender.com)**
- **[Demo Video →](./assets/Voyara_video.mp4)**
- **[API Documentation (Swagger UI) →](https://voyara.onrender.com/api-docs)**
- **[Mobile App Repository (Kotlin KMP) →](https://github.com/NitishChoubey/Voyara-Mobile-App-Platform)**
- **Technical Docs:**
  - [Flowchart & Architecture](./docs/FLOWCHART.md)
  - [Wireframes & DFDs](./docs/WIREFRAME_AND_DFD.md)

---

##  Key Differentiators

Voyara solves the hardest part of travel:

> **"What do I do when I get there?"**

###  1. Interactive Journey Timeline

Instead of static lists, Voyara uses a **visual timeline** that represents:
- Travel legs  
- Day-wise activity blocks (morning / afternoon / night)  
- Budget and time distribution  

**Impact:** Planning feels intuitive and engaging instead of overwhelming.


### Example: 3-Day Paris Trip in Voyara

- **Day 1:** Eiffel Tower → Louvre → Seine Cruise  
   Estimated Budget: €120  

- **Day 2:** Montmartre → Local cafés → Street exploration  
   Estimated Budget: €90  

- **Day 3:** Versailles Day Trip  
   Estimated Budget: €150  

All of this appears in **one structured timeline**, not scattered notes.

---

###  2. Local-First Discovery Engine

Voyara prioritizes **local activities and experiences** instead of generic tourist traps.

**Impact:** Users explore cities like locals, not checklist tourists.


###  3. Vega – Context-Aware AI Assistant

Vega is Voyara's intelligent **assistive AI** that helps users plan better without taking control away.

#### Design Principles
- User-in-the-loop (no autonomous actions)  
- Suggest, don't decide  
- Context-aware recommendations  
- Explainable reasoning  
- Fail-safe fallback  

#### What Vega Does
- Suggests activities for specific days  
- Helps optimize time and budget  
- Explains *why* a suggestion fits the itinerary  

#### What Vega Cannot Do
- Modify itineraries automatically  
- Perform bookings  
- Trigger background actions  
- Write to databases  

Vega remains **strictly assistive** — all suggestions require explicit user approval.


###  4. One-Click Budget Export

Voyara converts the entire itinerary into a structured **budget sheet**, including:
- Transport costs  
- Activity costs  
- Daily breakdown  

**Impact:** Offline-ready and practical for real travel use.


---

##  Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | Interactive UI & timeline |
| **UI Library** | shadcn/ui + Tailwind CSS | Component system & styling |
| **State Management** | TanStack React Query | Server state & caching |
| **Backend API** | Node.js + Express | REST API, auth, trip management |
| **AI Service** | FastAPI (Python) | Vega AI inference layer |
| **AI Engine** | GenAI / LLMs | Context-aware suggestions |
| **Database** | PostgreSQL (Supabase) | Relational data + auth + RLS |
| **Deployment** | Render | Web service hosting |
| **Mobile** | Kotlin Multiplatform (KMP) | [Separate repo](https://github.com/NitishChoubey/Voyara-Mobile-App-Platform) |


## Data Flow & System Design

Voyara follows a clean and modular architecture:

- User inputs flow through authentication and trip planning modules  
- Timeline data is processed centrally  
- Vega AI receives **read-only contextual data**  
- All suggestions return to the UI for **explicit user approval**  

Detailed **DFDs, Flowcharts, and Wireframes** are available inside [`/docs`](./docs/) and [`/assets`](./assets/).


## Future Scope

- AI-generated draft itineraries (user-approved)  
- Interactive maps & distance-based planning  
- Preference-based personalization  
- Group itinerary collaboration  
- Smart travel alerts & reminders  


---

<div align="center">

*TEAM MEMBERS 
**- SWATI** 
**- PRAKHAR**
**- LOVISH***

</div>

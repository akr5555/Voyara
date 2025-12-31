VOYARA – Travel Planning & Itinerary Management System

Voyara is a travel planning platform that helps users plan trips, build itineraries, manage budgets, explore destinations, and interact with a travel community.  
This document describes the **UI wireframes** and **Data Flow Diagram (DFD)** of the system.


## Project Scope

-  Complete UI wireframes
-  System navigation flow
-  Data Flow Diagram (DFD – Level 1)
-  Admin analytics overview


## UI Wireframes – Application Flow

**Screen Sequence:**

Login → Registration → Landing Page → Create Trip → Build Itinerary →  
Trip Listing → Profile → Search → Itinerary View → Community → Calendar → Admin Panel

![Voyara Wireframe Flow](../assets/voyara_wireframe.png)

Covered Features
- Authentication (Login & Registration)
- Trip creation and itinerary planning
- Search, community, and calendar views
- Admin dashboard and analytics


## Major Screens Overview

- **Login & Registration:** Secure authentication and user onboarding  
- **Landing Page:** Banner, search, filters, previous trips  
- **Trip & Itinerary:** Destination, dates, activities, budgets  
- **Trip Listing:** Ongoing, upcoming, and completed trips  
- **Profile:** User details and trip history  
- **Search:** City and activity-based exploration  
- **Community:** Posts, likes, and comments  
- **Calendar:** Date-wise trip visualization  
- **Admin Panel:** Analytics, reports, and insights  


## Data Flow Diagram (DFD – Level 1)

![Voyara DFD](../assets/voyara_dfd.png)

### DFD Components

**External Entities**
- E1: User (Traveler)
- E2: Admin

**Processes**
- P1.0 Authentication & Profile Management  
- P2.0 Trip & Itinerary Management  
- P3.0 Search & Browse Content  
- P4.0 Community Interaction  
- P5.0 Admin Analytics  

**Data Stores**
- D1 User Database  
- D2 Trip & Itinerary Database  
- D3 Activity / Location Database  
- D4 Community Database  

##  Architecture Summary

- Modular and scalable system design  
- Clear separation of system responsibilities  
- User-focused navigation with admin-level analytics  

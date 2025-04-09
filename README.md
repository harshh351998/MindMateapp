# MindMate 

This is the Angular-based frontend for the MindMate application, designed to work with the C# (.NET) backend.

## Architecture

### Technology Stack

- **Framework**: Angular 17
- **UI Components**: Angular Material
- **Styling**: SCSS
- **State Management**: Angular services with RxJS
- **Routing**: Angular Router
- **HTTP Client**: Angular HttpClient with interceptors
- **Charting**: Chart.js with ng2-charts

### Project Structure

```
src/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── header/
│   │   ├── footer/
│   │   └── sidenav/
│   ├── guards/               # Route guards
│   │   └── auth.guard.ts
│   ├── interceptors/         # HTTP interceptors
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── models/               # Data models/interfaces
│   │   └── user.model.ts
│   ├── pages/                # Page components
│   │   ├── dashboard/
│   │   ├── journal-list/
│   │   ├── journal-detail/
│   │   ├── journal-edit/
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   └── not-found/
│   ├── services/             # API services
│   │   ├── auth.service.ts
│   │   └── journal.service.ts
│   ├── app.component.ts      # Root component
│   └── app.routes.ts         # Application routes
├── assets/                   # Static assets
└── styles.scss               # Global styles
```

### Key Features

1. **Authentication System**
   - JWT-based authentication
   - Secure login and registration
   - Auth interceptor for adding tokens to requests
   - Error handling and automatic logout on 401

2. **Journal Management**
   - Create, read, update, delete journal entries
   - View journal entries with sentiment analysis
   - Filter entries by date, sentiment, mood

3. **Dashboard**
   - Overview of journal statistics
   - Recent entries
   - Mood trends over time
   - Sentiment analysis breakdown

4. **Responsive Design**
   - Mobile-friendly layout
   - Adaptive components
   - Material Design aesthetics

## Setup and Running

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
ng serve
```

3. Build for production:
```bash
ng build
```

## API Integration

The frontend connects to the C# backend API running at `http://localhost:5200`. API routes are proxied through the Angular dev server.

The following endpoints are used:
- `/api/Auth/register` - User registration
- `/api/Auth/login` - User login
- `/api/Auth/logout` - User logout
- `/api/JournalEntries` - CRUD operations for journal entries
- `/api/JournalEntries/user/{userId}` - Get entries for a specific user
- `/api/JournalEntries/user/{userId}/date-range` - Filter entries by date range
- `/api/JournalEntries/user/{userId}/sentiment/{sentiment}` - Filter entries by sentiment
- `/api/JournalEntries/user/{userId}/mood-rating/{moodRating}` - Filter entries by mood rating 

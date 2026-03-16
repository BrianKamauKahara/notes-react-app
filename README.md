# Student Notes Manager — Frontend Documentation

Deployed Application: https://notes-react-app-seven.vercel.app/

This documentation is mostly shallow, as the project is a small project, and I am still learning how to document software projects. Therefore, I employed the help of AI, yes, I know. I am willing to learn how to document my projects, but incrementally and eventually. 

## Table of Contents

1. [Overview](#overview) 
1. [Changelogs](#changelogs)
1. [Technology Stack](#technology-stack)  
1. [Deployment](#deployment)  
1. [Frontend Architecture](#frontend-architecture)  
1. [Core Components](#core-components)  
   - [Book Component](#book-component-container-component)  
   - [Note Component](#note-component)  
   - [Note Form Component](#note-form-component)  
1. [State Management Strategy](#state-management-strategy)  
1. [API Communication](#api-communication)  
1. [Loading and Error Handling](#loading-and-error-handling)  
1. [Styling Guidelines](#styling-guidelines)  
1. [Performance Considerations](#performance-considerations)  
1. [Testing Strategy](#testing-strategy)  
1. [Deployment Notes](#deployment-notes)  
1. [Environment Variables](#environment-variables)  
1. [Future Frontend Improvements](#future-frontend-improvements)  
1. [References](#references)

## Overview

The frontend of the **Student Notes Manager** is a React-based Single Page Application (SPA) responsible for user interaction, state presentation, and communication with the backend REST API.

---

## Changelogs

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.

## Technology Stack

- React
- JavaScript (ES6+)
- CSS (Global or Modular styling)

---

## Deployment

### Deployed Application

You can access the live application here:

https://notes-react-app-seven.vercel.app/

### Hosting Platform

The frontend is deployed on :contentReference[oaicite:0]{index=0}.

### Deployment Method

- Connected GitHub repository to Vercel
- Automatic builds triggered on push to main branch
- Production bundle generated using frontend build tool

---

## Frontend Architecture

### Main Application Structure

```
index.html
src/
│
├── components/
│   ├── Book.jsx
│   ├── Note.jsx
│   └── NoteForm.jsx
├── css/
│   ├── Book.css
│   ├── Note.css
│   └── NoteForm.css
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```

---

## Core Components

### Book Component (Container Component)

Responsibilities:

- Fetch notes from backend API
- Maintain global notes state
- Provide CRUD handlers
- Manage loading and error states

Main States Managed:
- notes
- selectedNote
- loadingStatus
- error

---

### Note Component

Displays individual note information.

Features:

- Title rendering
- Content preview
- Metadata display (createdAt, updatedAt)

Supported Actions:

- Edit note
- Delete note

---

### Note Form Component

Handles:

- Creating notes
- Updating notes
- Deleting notes

Characteristics:

- Controlled form inputs
- Validation before submission
- Async submission handling

---

## State Management Strategy

### Data Source Rules

- Fetch notes once during application mount. Notes are fetched in batches which will be fully implemented in a later version
- Update local state after mutations instead of refetching.
- Derive UI state where possible.

Pattern:

```
Backend → API Service Layer (for normalization) → React State → UI Rendering
```

---

## API Communication

Frontend communicates with backend via REST endpoints:

| Method | Purpose |
|---|---|
| GET | Fetch notes |
| POST | Create note |
| PATCH | Update note |
| DELETE | Delete note |


---

## Loading and Error Handling

### Loading States

- Display loading indicator during async operations.
- They are found within the Note Form and the main App on the initial fetching of notes on mount

---

### Error Handling

- Capture API errors.
- Display user-friendly messages.
- Log technical details for debugging.

---

## Styling Guidelines

- Layouts have been made semi-responsive, for now.
- Typography remained consistent via use of global css variables.
- Prefered soft shadows and centered container design.

Reference design pattern:

- Book-like container UI

---

## Performance Considerations

- Avoid unnecessary re-renders.
- Avoid repeated backend fetches.
- Not entirely sure what to add here.
---

## Future Frontend Improvements

- Better responsiveness
- Dark/light theme toggle 
- Search functionality
- Rich text editing support

and eventually,
- Offline caching
- Authorisation contexts

Refer to: [Unreleased](./CHANGELOG.md#unreleased)

---

## Testing Strategy

Recommended Frontend Tests:

- Component rendering tests
- Async API interaction tests
- State update correctness
- Error boundary handling

---

## Deployment Notes

- Build frontend using production optimization:

```
npm run build
```

- Serve static bundle via backend or CDN.

Note that: you will need to set up a .env file with the following environment variable:

```
VITE_API_BASE_URL=<backend_path>

```
---

## References

- https://react.dev/learn
- https://developer.mozilla.org/en-US/docs/Web/JavaScript

# Manara Website — Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white)

Single-page web application for **Manara**, a youth-led initiative from Gaza that provides students with technical workshops, field training and community programmes. It is the public face of the project and also contains the admin dashboard used to manage content.

It talks to the [Backend API](https://github.com/ManaraWebsite/Backend), a Laravel REST API. The repository and local folder for this project are spelled `Fronend`.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Integration with the Backend](#integration-with-the-backend)
- [Testing and Linting](#testing-and-linting)
- [Deployment Notes](#deployment-notes)
- [Team & Contributors](#team--contributors)
- [Future Improvements](#future-improvements)

## Overview

The application has two audiences:

| Audience | What the app gives them |
|---|---|
| **Visitors and students** | A bilingual (Arabic / English) site that tells Manara's story, lists open workshops and lets people register for them, shows testimonials ("Field Voices") and published posts, and offers a contact form. |
| **Manara admins** | A protected dashboard to build registration forms, review and export submissions, publish posts and manage testimonials, without needing a developer. |

Arabic is the default language and the interface switches between right-to-left and left-to-right layouts with the language. Content that comes from the API is bilingual (`{ ar, en }`); the English text is produced by the backend's automatic translation.

## Key Features

**Public site**
- **Cinematic home page** with a splash screen, a Three.js lighthouse scene and a scroll-driven story told in chapters. If the 3D scene fails to initialise, a static fallback is shown instead, and animations respect the visitor's reduced-motion preference.
- **Workshops** section built from the active forms returned by the API, with the newest workshop featured and a link to register.
- **Services** and **Activities** sections. Activities ("real moments") is a scroll-driven gallery of photos and videos served from `public/media/activities`.
- **Field Voices** — the latest published testimonials from the API.
- **Posts** — latest published posts, plus a full post page (`/posts/:slug`) with reading time, a reading-progress bar and links to other articles.
- **Contact form** with topic shortcuts that other buttons on the page can pre-select. It sends mail through the third-party [FormSubmit](https://formsubmit.co) service, not through the Manara backend.
- **Dynamic registration page** (`/forms/:slug`) rendered from the form definition returned by the API: text, textarea, email, number, date, select, radio, checkbox and PDF-upload fields, with client-side validation that mirrors the backend rules, server-side error display, a "form closed" state and a redirect after success.
- **Language switcher** (AR / EN) remembered in `localStorage`; `lang` and `dir` on `<html>` are kept in sync.
- **Progressive Web App**: installable manifest and an auto-updating service worker.

**Admin dashboard** (`/admin`)
- Login restricted to users with the `admin` role.
- **Forms:** list, create, edit, delete and duplicate; a field builder (add, remove and reorder fields, edit choice options) with cover image upload; submissions table; CSV export.
- **Posts:** list, create, edit, delete, publish and unpublish, with cover image upload.
- **Field Voices:** list, create, edit and delete, with image upload.
- Responsive layout with a mobile menu, and automatic redirect to the login page when the session expires.

## Technologies Used

| Category | Technology |
|---|---|
| Language | JavaScript (ES modules, JSX) |
| UI framework | React 19 |
| Routing | React Router 7 (`react-router-dom`) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, plus custom CSS in `src/index.css` |
| HTTP client | Axios |
| Animation and graphics | Framer Motion 12, Three.js, a custom WebGL aperture effect (`src/lib/apertureGL.js`) |
| Icons | `react-icons` |
| Build tool | Vite 8 with `@vitejs/plugin-react` |
| PWA | `vite-plugin-pwa` |
| Linting | Oxlint (React and Oxc plugins) |
| Tests | Node's built-in test runner (`node:test`) |
| Fonts | DIN Next LT Arabic (Regular and Medium), self-hosted in `public/Fonts` |
| Deployment config | `vercel.json` (single-page-app rewrite) |

## Project Architecture

### Application structure

The app is a client-rendered SPA. `src/main.jsx` mounts `LanguageProvider` and `App`; `src/App.jsx` declares all routes. Public pages are in `src/Component`, and everything that talks to the admin API lives in `src/Api` (the folder name is historical: it holds the admin pages and the public registration page together with the Axios client). Shared helpers are in `src/lib`, reusable hooks in `src/hooks`, and static copy in `src/translations.js` and `src/content`.

The home page and the 404 page are bundled in the main chunk. Every other page is loaded with `React.lazy`, so visitors never download the admin dashboard.

### Routing

| Path | Component | Access |
|---|---|---|
| `/` | `Home` | Public |
| `/posts/:slug` | `PostDetail` | Public |
| `/forms/:slug` | `PublicFormView` | Public |
| `/admin/login` | `AdminLogin` | Public |
| `/admin` | redirects to `/admin/forms` | Admin |
| `/admin/forms` | `FormsList` | Admin |
| `/admin/forms/create` | `CreateForm` | Admin |
| `/admin/forms/edit/:slug` | `EditForm` | Admin |
| `/admin/forms/:slug/submissions` | `FormSubmissions` | Admin |
| `/admin/posts` | `PostsList` | Admin |
| `/admin/posts/create` | `PostForm` | Admin |
| `/admin/posts/edit/:slug` | `PostForm` | Admin |
| `/admin/field-voices` | `FieldVoicesAdmin` | Admin |
| `/admin/field-voices/create` | `FieldVoiceForm` | Admin |
| `/admin/field-voices/edit/:id` | `FieldVoiceForm` | Admin |
| `*` | `NotFound` | Public |

Home-page sections are anchors (`#workshops`, `#services`, `#stories`, `#posts`, `#contact`) and the navbar highlights the section currently in view.

### State management

There is no global state library.

- **Language:** `LanguageContext` provides `lang` (`'AR'` or `'EN'`), a toggle and the translation dictionary `t` from `src/translations.js`. It persists the choice under the `manara_lang` key.
- **Server data:** each screen fetches what it needs with Axios in `useEffect` and keeps it in local component state. `usePosts` is the one shared data hook.
- **Session:** the admin token is kept in `localStorage` (key `admin_token`) behind the helpers in `src/lib/auth.js`, which tolerate storage being unavailable.
- **Cross-component messaging:** a small `CustomEvent` channel (`src/lib/contactIntent.js`) lets buttons anywhere on the home page set the topic of the contact form.

### API integration

All requests go through one Axios instance (`src/Api/axiosClient.js`):

- base URL: `VITE_API_URL` if set, otherwise `/api`;
- adds `Authorization: Bearer <token>` when a token is stored;
- lets the browser set the multipart boundary for `FormData` and sends JSON otherwise;
- on `401` (or `403` for `/admin` requests) inside the dashboard, clears the session and redirects to `/admin/login?reason=expired|forbidden`.

`src/lib/localize.js` picks the right language from the `{ ar, en }` objects the API returns and falls back to the other language when a translation is not ready yet. `src/lib/media.js` resolves image paths, and `src/lib/apiError.js` turns Laravel validation responses into readable messages.

| Screen | Request |
|---|---|
| Admin login | `POST /login`; `POST /logout` (to discard a non-admin token) |
| Admin shell | `GET /user`, `POST /logout` |
| Workshops section | `GET /forms` |
| Registration page | `GET /forms/{slug}`, `POST /forms/{slug}/submit` (multipart) |
| Field Voices section | `GET /field-voices` |
| Posts section / post page | `GET /posts`, `GET /posts/{slug}` |
| Admin forms | `GET /admin/forms`, `GET /admin/forms/{slug}`, `POST /admin/forms`, `POST /admin/forms/{slug}` with `_method=PUT`, `DELETE /admin/forms/{slug}`, `POST /admin/forms/{slug}/duplicate` |
| Admin submissions | `GET /admin/forms/{slug}/submissions`, `GET /admin/forms/{slug}/submissions/export` (downloaded as a blob) |
| Admin posts | `GET /admin/posts`, `GET /admin/posts/{slug}`, `POST /admin/posts`, `POST /admin/posts/{slug}` with `_method=PUT`, `DELETE /admin/posts/{slug}`, `POST /admin/posts/{slug}/publish`, `POST /admin/posts/{slug}/unpublish` |
| Admin field voices | `GET /admin/field-voices`, `POST /admin/field-voices`, `POST /admin/field-voices/{id}` with `_method=PUT`, `DELETE /admin/field-voices/{id}` |

Updates that may carry a file are sent as `POST` with `_method=PUT` because PHP does not parse multipart bodies on `PUT`.

### Authentication flow

1. The admin enters email and password on `/admin/login`; the app calls `POST /login`.
2. The backend issues a token to any valid user, so the app checks `user.role`. If it is not `admin`, the token is revoked with `POST /logout` and an error is shown.
3. For admins, the token is saved in `localStorage` and the app navigates to `/admin/forms`.
4. `ProtectedRoute` redirects to `/admin/login` when no token exists. `AdminDashboard` then calls `GET /user` to confirm the token is valid and the role is still `admin`.
5. Every request carries the bearer token. If the backend answers `401`/`403`, the interceptor clears the session and sends the user back to the login page with an explanatory message.
6. Logout calls `POST /logout`, clears the stored token even if the request fails, and returns to the login page.

The route guard only checks that a token is present; authorization is enforced by the backend on every admin request.

## Project Structure

```
Fronend/
├── index.html                  App shell (lang="ar", dir="rtl", font preloads)
├── package.json
├── vite.config.js              React, Tailwind and PWA plugins; three.js pre-bundling
├── vercel.json                 SPA rewrite to index.html
├── .oxlintrc.json              Oxlint rules
├── public/
│   ├── Fonts/                  DIN Next LT Arabic
│   ├── media/activities/       Optimised photos (WebP) and videos for the Activities section
│   └── *.png, *.svg            Logos and PWA icons
├── src/
│   ├── main.jsx                Entry point
│   ├── App.jsx                 Routes, lazy loading, ProtectedRoute
│   ├── LanguageContext.jsx     AR / EN state
│   ├── translations.js         UI strings (AR / EN)
│   ├── index.css               Tailwind import and custom styles
│   ├── Api/                    Axios client, public registration page, admin pages
│   │   ├── axiosClient.js
│   │   ├── AdminLogin.jsx, AdminDashboard.jsx
│   │   ├── FormsList.jsx, CreateForm.jsx, EditForm.jsx, FormBuilder.jsx, FormSubmissions.jsx
│   │   ├── PostsList.jsx, PostForm.jsx
│   │   ├── FieldVoicesAdmin.jsx, FieldVoiceForm.jsx
│   │   └── PublicFormView.jsx
│   ├── Component/              Public pages and sections (Home, Hero*, ManaraStory, Services,
│   │                           Activities, UserWorkshops, SuccessStories, LatestPostsSection,
│   │                           PostDetail, Contact, Navbar, Footer, NotFound, …)
│   ├── content/                Static copy and media manifests (story chapters, activities)
│   ├── hooks/                  usePosts, useObjectUrl
│   └── lib/                    auth, apiError, localize, media, formBuilder, brand helpers,
│                               Three.js / WebGL helpers, scroll timelines, contact-intent events
└── tests/                      node:test unit tests for lib helpers
```

## Installation and Setup

### Prerequisites

- **Node.js** and **npm**. Use a Node version supported by Vite 8 (the project does not declare an `engines` field).
- The [Backend](https://github.com/ManaraWebsite/Backend) running locally if you want live data (workshops, posts, testimonials, admin dashboard). Without it the site still loads, but those sections show their error or empty states.

### Steps

```bash
# 1. Clone
git clone git@github.com:ManaraWebsite/Fronend.git
cd Fronend

# 2. Install dependencies
npm install
```

3. **Point the app at the API.** `vite.config.js` does not define a dev-server proxy, so the default relative `/api` would hit the Vite server itself. Create `.env.local` (git-ignored) and set the backend URL:

   ```dotenv
   VITE_API_URL=http://localhost:8000/api
   ```

## Environment Variables

The app reads a single variable (see `src/Api/axiosClient.js`). The repository has no `.env.example`, so create `.env.local` yourself.

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Recommended for local development | `/api` | Base URL of the backend API, including the `/api` prefix. Leave unset when the SPA and the API are served from the same origin. |

Vite exposes `VITE_*` variables to the browser bundle, so never put secrets in them.

## Running the Project

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (default `http://localhost:5173`) |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with Oxlint |

A typical local session:

1. Start the backend (`php artisan serve` and `php artisan queue:work`; see the Backend README).
2. In this folder, run `npm run dev` and open `http://localhost:5173`.
3. Visit `/admin/login` and sign in with an admin account created in the backend (the backend's seeder creates a development admin).

## Integration with the Backend

- **Base URL:** `VITE_API_URL`, or `/api` on the same origin. The production code comments describe the SPA and API being served from one origin through a reverse proxy; that proxy configuration is not part of this repository.
- **Authentication:** Laravel Sanctum bearer tokens obtained from `POST /api/login`; no cookies or CSRF handshake are used.
- **CORS:** when `VITE_API_URL` points to another origin (as in local development), the backend must allow it. The backend currently relies on Laravel's default CORS configuration.
- **Media:** the API returns absolute image URLs derived from the backend's `APP_URL`. `resolveMediaUrl` also resolves relative storage paths against the API origin.
- **Content shape:** localised fields arrive as `{ ar, en }`. English can be empty while the backend's translation job has not finished, in which case the Arabic text is shown.
- **Limits that mirror the backend:** cover images 2 MB, field-voice images 255 KB, registration PDFs 5 MB; registration submissions are rate-limited to 5 per minute (HTTP 429 is shown as a "too many attempts" message).
- **Service worker:** `/api`, `/storage`, `/sanctum` and `/media` are excluded from the PWA navigation fallback so downloads and signed file links open correctly.

## Testing and Linting

Unit tests cover the pure helpers in `src/lib` (word-reveal maths and the story timeline). They use Node's built-in runner; there is no `npm test` script.

```bash
node --test "tests/*.test.js"
npm run lint
```

> **Current status:** of the 10 tests, 9 pass. The test *"the four chapters tell the story with the approved texts…"* in `tests/clarity.test.js` fails because it asserts chapter titles that differ from the current copy in `src/content/manaraStory.js`; the test (or the copy) needs to be reconciled.

There are no component or end-to-end tests.

## Deployment Notes

- `npm run build` produces a static site in `dist/`. Any static host works as long as unknown paths fall back to `index.html` (client-side routing).
- `vercel.json` already contains that fallback rewrite for Vercel.
- If the API is on a different origin than the site, set `VITE_API_URL` at **build time** (Vite inlines it).
- No Dockerfile, CI workflow or reverse-proxy configuration is included in this repository.

## Team & Contributors

| Full name | Role | Main responsibilities and contributions |
|---|---|---|
| ALBaraa R. ALSaiqali | Team Leader, Backend Developer | Led the team; developed the [backend API](https://github.com/ManaraWebsite/Backend) this application consumes; also contributed to the frontend. |
| Basma Alsayed | Frontend Developer | Developed the frontend application. |

<!-- TODO(team): add more detailed responsibilities per member if desired. -->


## Future Improvements

These are suggestions based on gaps found while documenting the code. **None of them is implemented yet.**

- Add a `.env.example`, and a Vite dev-server proxy for `/api` and `/storage`, so local development works without setting `VITE_API_URL`.
- Add an `npm test` script and fix the failing story-copy test.
- Add pagination or search to the admin lists and show `translation_status` so admins can see when English text is ready or has failed.
- Show the post `form_link` once the backend returns it (the API currently stores but does not expose it).
- Add component and end-to-end tests for the admin flows and the registration form.
- Declare supported Node versions in `package.json` (`engines`) and replace the template package name (`my-project`).

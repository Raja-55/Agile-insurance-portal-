# Agile Insurance

Frontend-only React + Vite insurance portal with policy discovery, checkout, dashboard flows, local demo auth, local document vault storage, and an optional OpenAI-powered AI support popup.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Lucide React
- React Icons
- Browser localStorage for demo auth, sessions, purchases, payments, claims, and documents

## Setup

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Frontend Demo Auth

Registration and login are handled locally in the browser.

- Register with any valid name, email, phone, and password.
- Use demo OTP `123456` to verify the account.
- Login later with the same email and password.
- Logout clears only the current session.

## Documents

The dashboard Documents page stores uploaded files locally in browser storage for demo purposes. Download buttons open locally saved file data URLs. Policy documents generated from purchases remain demo records.

## OpenAI Assistant

The floating AI support popup can call the OpenAI Responses API directly from the frontend.

Create a `.env` file in the project root:

```bash
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_MODEL=gpt-5.5
```

Then restart the Vite dev server.

Note: browser-side API keys are visible to users. This is acceptable for a local demo, but production apps should call OpenAI through a secure server or serverless proxy.

## Logo And Favicon

The Agile Insurance logo lives at:

```text
public/agile-insurance-logo.svg
```

The browser tab icon lives at:

```text
public/favicon.svg
```

Replace those SVG files when changing the app logo. The public header and dashboard sidebar already point to `public/agile-insurance-logo.svg`.

## Important Files

- `src/contexts/AuthContext.jsx` - frontend-only auth and session state
- `src/utils/api.js` - local token helpers, file readers, and OpenAI chat helper
- `src/components/FloatingAiAssistant.jsx` - AI support popup UI
- `src/pages/dashboard/DashboardDocuments.jsx` - local document vault
- `src/pages/dashboard/DashboardContact.jsx` - contact, WhatsApp, mobile, and email UI
- add new feature ADMIN and USER 2FA verification and password reset 


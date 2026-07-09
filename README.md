# GigCraft AI — Chrome Extension & API Backend

GigCraft AI is a production-ready Chrome Extension and companion backend service designed as an AI writing assistant for Fiverr freelancers. It converts raw service notes, tech stack lists, and copy-pasted research data into complete, conversion-optimized Fiverr gig drafts.

The extension strictly follows safety guidelines: it does NOT auto-submit forms, bypass CAPTCHAs, or automate account operations. It works entirely as a copy/paste helper and side panel overlay.

---

## Project Structure

```
gigcraft-ai/
├── apps/
│   ├── api/          # Node.js + Express + Mongoose + DeepSeek API
│   └── extension/    # React + TypeScript + Vite + Tailwind CSS (Popup & Content Script)
├── packages/
│   └── shared/       # Shared models, types, and Zod validation schemas
├── package.json      # Workspace configurations
└── tsconfig.json     # Base TS config
```

---

## Tech Stack & Highlights

- **Backend**: Express API, MongoDB connection (Mongoose), Helmet & CORS protection, JWT Authentication, and rate-limiting on both standard and AI generation endpoints.
- **DeepSeek Integration**: Structured JSON outputs validated using Zod, featuring an automatic correction retry fallback on schema mismatches.
- **Chrome Extension**: Styled with custom Tailwind layout, utilizing Zustand state management.
- **Page Assistant**: Injected floating panel insulated with Shadow DOM to prevent style overrides on `fiverr.com`, interacting with DOM elements via an isolated adapter.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port `27017` or via MongoDB Atlas URI)
- A DeepSeek API Key

### 1. Configuration (Backend)
Navigate to the API folder, duplicate the `.env.example` file as `.env`, and populate it:
```bash
cd apps/api
cp .env.example .env
```
Ensure to insert your `DEEPSEEK_API_KEY` and define a custom `JWT_SECRET`.

### 2. Install Dependencies
Run the install command at the root workspace:
```bash
npm install
```

### 3. Build Shared Packages
Build the shared package before running the projects:
```bash
npm run build:shared
```

### 4. Running Backend Dev Server
Boot up the local Express API:
```bash
npm run dev:api
```
The server will start listening at `http://localhost:5000`.

### 5. Compile the Chrome Extension
To bundle the popup UI and content scripts:
```bash
npm run build:extension
```
This generates the compile output in `apps/extension/dist/`.

---

## Loading the Extension in Google Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/` by typing it into the URL bar.
3. Enable **Developer Mode** using the toggle switch in the top-right corner.
4. Click on **Load unpacked** in the top-left corner.
5. Select the **`apps/extension/dist`** folder from the project directory.
6. The "GigCraft AI" card will appear, and you can pin it to your toolbar!

---

## Core Features & Workflow

1. **Authentication**: Register or log in to the extension popup. It securely stores your session token locally.
2. **Dashboard**: View your saved drafts, template guides, and a history feed of previous executions.
3. **Wizard**: 
   - **Step 1**: Choose service type, write raw details, and insert technology tag lists.
   - **Step 2**: Paste research notes, competitor details, or ChatGPT outline logs directly into the text fields.
4. **AI Generation**: DeepSeek writes optimized title options, pricing grids, details, FAQs, buyer requirements, and thumbnail blueprints.
5. **Results Screen**: Review drafts in editable cards. You can edit fields, copy content, or regenerate single sections with custom modifier directives.
6. **Page Assistant overlay**: When browsing `https://*.fiverr.com/*` gig creation pages, a floating "✨ GigCraft Assistant" button appears. Select a draft to auto-fill the Title and Description elements safely.

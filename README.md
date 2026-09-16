# Memory Rush 🧠⚡

A fast-paced, arcade-style memory matching web game engineered with high-precision mechanics, rhythmic combo multipliers, tactical power-ups, and daily challenges.

Built as a standalone, zero-dependency client web application using React 19, TypeScript, Vite, Tailwind CSS, and the Web Audio API.

---

## 🎮 Key Features

- **Three Game Modes:**
  - **Classic Campaign:** Progressive difficulty from Level 1 (2×3 grid) up to Level 6 (6×6 grid) with shrinking combo windows and adaptive challenge.
  - **Time Attack:** Fast-paced survival mode where matches award bonus seconds (+4s) and blunders deduct penalty time (-2s).
  - **Daily Challenge:** Seeded, deterministic daily puzzles synchronized worldwide via UTC date hashing with persistent streak tracking.
- **Fair-Play Scoring Architecture:**
  - **Bounded Combo Multipliers:** Scaled linearly from 1.00× up to a hard cap of 2.50× (preventing runaway exponential point inflation).
  - **Latency Speed Bonus:** Awards 10 to 50 points based on cognitive recall speed.
  - **Level Clear Bonuses:** End-of-round awards for remaining time and decision accuracy (up to +400 bonus points for flawless recall).
- **Tactical Power-Up System:**
  - 📡 **Radar Scan:** Intelligently locates and briefly reveals the twin of the currently active card or an unmatched pair.
  - ❄️ **Freeze Clock:** Halts both game time and combo decay for 5 critical seconds.
  - 🛡️ **Shield:** Absorbs a mistaken flip or cognitive blunder, preserving the active combo multiplier.
- **Cognitive Memory & Anti-Exploit Mechanics:**
  - **Blunder Tracking:** Identifies whether a mismatch was honest exploration or a forgotten card twin that had already been revealed.
  - **Anti-Pause Buffering Veil:** Obscures hidden cards during pause to prevent board study, accompanied by timestamp delta compensation.
  - **Race-Condition-Proof Input Locks:** Authoritative selection guards prevent multi-touch desynchronization or fast-click race conditions.
- **Synthesized Audio Engine:** Built directly on the native browser Web Audio API—generates responsive card flips, match chimes, freeze pulses, and fanfare without relying on external MP3/WAV assets.
- **Full Offline Persistence:** LocalStorage management with automatic schema recovery for best scores, win streaks, lifetime stats, and accessibility preferences.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `1` | Activate Radar / Twin Reveal |
| `2` | Activate Freeze Clock |
| `3` | Activate Shield |
| `P` or `Esc` | Pause / Resume Game |
| `M` | Mute / Unmute Audio |
| `Shift + T` | Execute Internal Game Logic Test Suite |

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5.8](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Motion](https://motion.dev/)
- **Visual FX:** [Canvas-Confetti](https://www.kirilv.com/canvas-confetti/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Sound:** Native Web Audio API Synthesizer

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/memory-rush.git

# 2. Navigate to directory
cd memory-rush

# 3. Install dependencies
npm install
```

### Development Server

Start the local development server on `http://localhost:3000`:

```bash
npm run dev
```

### Running Tests

Execute the 39-point autonomous game logic verification suite (card pairing distribution, deterministic PRNG shuffling, combo multiplier limits, scoring clamping, timer mechanics):

```bash
npm test
```

### Type Checking & Linting

```bash
npm run lint
```

### Production Build

Build the optimized static web assets for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The compiled output will be generated in the `/dist` directory.

---

## 🌐 Standalone Deployment Options

Since **Memory Rush** builds to pure static web assets, it can be deployed for free to any static hosting provider:

### Deploy to Vercel
```bash
npx vercel
```

### Deploy to Netlify
Drag and drop the `/dist` folder into [Netlify Drop](https://app.netlify.com/drop), or use the Netlify CLI:
```bash
npx netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages
1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add the following scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. In `vite.config.ts`, set the base path if using a subfolder repository:
   ```ts
   export default defineConfig({
     base: '/memory-rush/',
     // ...
   });
   ```
4. Run:
   ```bash
   npm run deploy
   ```

### Deploy to Cloud Run / Docker
A standard Nginx container can serve the `/dist` folder directly:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📁 Project Structure

```text
├── public/
│   ├── favicon.svg             # Vector app icon
│   └── manifest.webmanifest    # Standalone Web App PWA manifest
├── src/
│   ├── components/             # UI components
│   │   ├── BackgroundParticles.tsx
│   │   ├── Card.tsx            # 3D interactive flip card
│   │   ├── ComboMeter.tsx      # Rhythmic multiplier progress bar
│   │   ├── DailyChallengeModal.tsx
│   │   ├── FloatingFeedback.tsx
│   │   ├── GameHUD.tsx         # Score, timer, combo & shield indicators
│   │   ├── GameOverModal.tsx
│   │   ├── HomeScreen.tsx      # Main menu & mode selector
│   │   ├── HowToPlayModal.tsx  # Game guide
│   │   ├── LevelCompleteModal.tsx # Performance & accuracy breakdown
│   │   ├── MemoryBoard.tsx     # Responsive grid & pause veil
│   │   ├── PauseModal.tsx
│   │   ├── PowerUpsBar.tsx     # Radar, Freeze, and Shield controls
│   │   └── SettingsModal.tsx   # Audio, haptics & reduced motion
│   ├── test/
│   │   └── runTests.ts         # CLI test runner
│   ├── testing/
│   │   └── selfTestRunner.ts   # 39-point game logic assertions
│   ├── App.tsx                 # Core game controller & state machine
│   ├── audio.ts                # Web Audio API procedural sound synthesizer
│   ├── gameConfig.ts           # Pure functions: scoring, board generation, configs
│   ├── storage.ts              # LocalStorage manager with schema migrations
│   ├── types.ts                # TypeScript interfaces, types & enums
│   └── main.tsx                # Entry point
├── index.html                  # HTML entry point with metadata
├── package.json                # Project manifest & scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

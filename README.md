# Daydream

A cozy, gamified journaling and to-do desktop app. Manage tasks, keep a journal, and watch your pixel-art room reflect your productivity.

## Features

- **Pixel-art room** that gets cluttered when tasks pile up and restores when you complete them
- **Task system** with checkbox, percentage, and subtask completion modes
- **Daily lifecycle** with day closure, task deferral, and missed-day handling
- **Widgets** — Quick Capture, Scratchpad, Journal, Daily Review, Calendar, Countdowns
- **Theme Studio** with 7 scene presets, custom accent colors, weather effects, and seasonal themes
- **Moveable dock** that snaps to any edge (left, right, top, bottom)
- **Local persistence** — all data saved to localStorage, no account required

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [Git](https://git-scm.com/)

## Clone and Run

```bash
git clone https://github.com/joannakiruba/Daydream.git
cd Daydream
npm install
```

### Browser (development)

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

### Browser (production preview)

```bash
npm run build
npm run preview
```

### Desktop (development)

Runs Vite dev server and opens Electron pointing at it:

```bash
npm run electron:dev
```

### Desktop (production installer)

Build an installer for your current platform:

```bash
npm run electron:build
```

Or target a specific platform:

```bash
# Windows — produces an NSIS installer in release/
npm run electron:build:win

# macOS — produces a .dmg in release/
npm run electron:build:mac

# Linux — produces an AppImage in release/
npm run electron:build:linux
```

Installers are written to the `release/` directory.

## Project Structure

```
daydream/
├── electron/              # Electron main process
│   ├── main.cjs           # Window creation, dev/prod loading
│   └── preload.cjs        # Context bridge
├── public/                # Static assets
├── src/
│   ├── components/
│   │   ├── dock/          # Dock bar and icon buttons
│   │   ├── drawer/        # Slide-out widget panel
│   │   ├── room/          # Pixel-art bedroom scene, rain/snow effects
│   │   ├── tasks/         # Task list, editor, daily view
│   │   └── widgets/       # All widget panels (journal, calendar, etc.)
│   ├── lib/               # Pure logic — dates, clutter engine, theme engine
│   ├── stores/            # Zustand stores with localStorage persistence
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Shell layout
│   ├── index.css          # CSS custom properties, keyframes, resets
│   └── main.tsx           # React entry point
├── electron-builder.json  # Desktop packaging config
├── tsconfig.app.json      # TypeScript config (strict mode)
└── vite.config.ts         # Vite config (base: './' for file:// compat)
```

## Scripts

| Command                    | Description                              |
|----------------------------|------------------------------------------|
| `npm run dev`              | Start Vite dev server                    |
| `npm run build`            | Type-check and build for production      |
| `npm run preview`          | Preview production build in browser      |
| `npm run lint`             | Run oxlint                               |
| `npm run electron:dev`     | Dev server + Electron window             |
| `npm run electron:build`   | Build installer for current platform     |
| `npm run electron:build:win` | Build Windows NSIS installer           |
| `npm run electron:build:mac` | Build macOS .dmg                       |
| `npm run electron:build:linux` | Build Linux AppImage                 |

## Tech Stack

- **React 19** + **TypeScript 6** (strict mode)
- **Vite 8** for dev server and bundling
- **Zustand** for state management
- **Framer Motion** for drawer animations
- **Electron** for desktop packaging
- **electron-builder** for installer generation

## Theming

Open the Theme Studio widget (◐ icon in the dock) to switch between presets, pick a custom accent color, toggle weather effects, and adjust animation speed. Theme choices persist across sessions.

Available presets: Rainy Bedroom, Warm Sunset, Midnight Study, Spring Morning, Summer Dusk, Autumn Cozy, Winter Frost.

## Data Storage

All data is stored in the browser's `localStorage` under namespaced keys:

- `daydream:task-data` — tasks, projects, assignments, day records
- `daydream:widget-state` — dock position, active widget
- `daydream:theme-state` — selected preset, accent color, weather, animation
- `daydream:captures` — quick capture notes
- `daydream:journal` — journal entries
- `daydream:scratchpad` — scratchpad text
- `daydream:countdowns` — countdown timers

Clearing browser/Electron storage resets all data.

## License

Private project.

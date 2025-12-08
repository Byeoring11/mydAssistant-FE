# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit frontend application called "pp-frontend" that serves as a "Mydata Assistant" - a multi-tool web application with specialized modules for data processing and analysis tasks.

## Development Commands

### Essential Commands
- **Development server**: `npm run dev`
  - Runs on `http://0.0.0.0:5173` (accessible on local network)
  - Hot module replacement enabled via Vite
- **Build**: `npm run build`
  - Creates production build in `.svelte-kit/output`
- **Preview production**: `npm run preview`
  - Preview the production build locally

### Code Quality
- **Type checking**: `npm run check` (one-time) or `npm run check:watch` (watch mode)
  - Runs svelte-check for TypeScript validation
- **Formatting**: `npm run format`
  - Formats all files with Prettier
- **Linting**: `npm run lint`
  - Runs both ESLint and Prettier checks

Always run `npm run lint` and `npm run check` before committing to ensure code quality and type safety.

## Architecture Overview

### Tech Stack
- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript
- **Styling**: CSS with custom properties and gradients
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript and Svelte plugins
- **Formatting**: Prettier

### Project Structure
```
src/
├── lib/                          # Shared library code
│   ├── components/               # Reusable components
│   │   ├── svg/                  # SVG components and icons
│   │   └── ui/                   # UI components (ContainerTab, FloatingUI)
│   ├── api/                      # API client utilities
│   ├── constants/                # App constants (server configs)
│   ├── errors/                   # Error handling utilities
│   └── utils/                    # Common utilities and transitions
└── routes/                       # SvelteKit file-based routing
    ├── +layout.svelte           # Main app layout with sidebar nav
    ├── +layout.ts               # Layout data loader (nav items)
    ├── deud/                    # 대응답 (response loading) module
    ├── bxm4/, bxm5/             # BXM modules
    ├── diff/                    # Diff utility module
    └── utils/                   # Utils module
```

### Key Features

**Multi-Module Application**: The app has a sidebar navigation with 6 main modules:
- **대응답 (deud)**: Response data loading automation with WebSocket real-time updates
- **Stub**: Multi-customer data loading workflow with 3-step automation (SSH → SCP → SSH)
- **BXM5/BXM4**: Data processing modules
- **Diff**: File/data comparison utilities
- **Utils**: General purpose utilities

**Real-time Features**: The deud module includes WebSocket services for real-time task monitoring and timer functionality.

**UI/UX Elements**:
- Glass morphism design with backdrop filters
- Gradient backgrounds and text effects
- Interactive background toggle with team member image
- Smooth page transitions with crossfade animations
- Floating notification system with type-based styling (info, success, warning, error)
- Promise-based confirm dialogs for critical user actions
- Tag-based multi-value inputs with animations
- Real-time validation feedback with visual indicators

## Module-Specific Architecture

### Deud Module (대응답)
Located in `src/routes/deud/`, this is the most complex module featuring:
- **Services**: `WebSocketService.ts`, `TimerService.ts`
- **State Management**: Svelte stores for tasks and timers
- **Types**: WebSocket, Timer, and Task type definitions
- **Modules**: TaskManager, Timer, CusnoValidator, and worker.js
- **Components**: Tab-based interface with loading states and modal logs

Key files:
- `DeudTab0.svelte`: Main interface component
- `TaskStore.ts`, `TimerStore.ts`: Reactive state management
- `WebSocketService.ts`: Real-time communication with backend

### Stub Module (NEW)
Located in `src/routes/stub/`, this module automates multi-step data loading workflows:

**Architecture**:
- **ContainerTab Pattern**: Uses `+page.svelte` with ContainerTab for sub-tab navigation
- **Directory Structure**: Organized with `load/` subdirectory for related components
- **Session-based Workflow**: Ensures atomic execution of 3-step process (DAT generation → SCP transfer → Data loading)

**Key Features**:
- **Multi-Customer Input**: Tag-based UI for multiple customer numbers (9-digit or 10-digit)
  - Real-time validation with visual feedback (✓/✗ icons)
  - Auto-detection for paste operations (space/comma/newline separated)
  - Confirmation via Enter/Space/Comma keys
  - Backspace to remove last tag
  - Tag animations using Svelte transitions (flip, fly, receive)
- **Glass Morphism UI**: Modern design with backdrop filters and gradients
- **Promise-based Dialogs**: Async confirm dialogs for user interactions
- **Real-time Progress**: 3-step workflow with individual timers and status indicators
- **Task Cancellation**: Immediate stop via asyncio Task cancellation (no polling)
- **Server Health Monitoring**: Real-time SSH server status indicators

**Component Architecture** (Refactored for modularity):
- `load/StubLoadTab.svelte`: Main container (159 lines, down from 870)
  - Lifecycle management (onMount, beforeNavigate, onDestroy)
  - Workflow orchestration (start, stop)
  - Clean composition with composables + components
- `load/composables/`: Reusable logic hooks
  - `useCustomerNumberInput.svelte.ts`: Customer number input management
    - Input validation with real-time feedback
    - Tag addition/removal logic
    - Keyboard event handling
    - Returns reactive state + actions
- `load/components/`: UI components directory
  - `ControlBar.svelte`: Status indicator + input field + action buttons
  - `CustomerNumberTags.svelte`: Animated tag display with removal
  - `WorkflowStatus.svelte`: 3-step progress with timers and animations
  - `OutputLogs.svelte`: Real-time log display
  - `index.ts`: Barrel exports for clean imports
- `load/constants.ts`: Shared constants and helper functions
  - `getStepIcon()`, `getStepColor()`: Step visualization helpers
  - `WORKFLOW_STEPS`: Step metadata array

**Services & State**:
- `load/CusnoValidator.ts`: Customer number validation (9/10 digit support)
- `store.ts`: Svelte store for workflow state, timers, and customer numbers
- `websocket.ts`: StubWebSocketService for real-time communication
- `TimerService.ts`: Multi-timer management (total + 3 step timers)
- `types.ts`: TypeScript interfaces for WebSocket messages and state

**Validation System** (`CusnoValidator`):
```typescript
- Supports both 9-digit and 10-digit customer numbers
- Split by whitespace, comma, or newline for bulk input
- No normalization (preserves original format)
- extractValidCusno(): Returns array of valid numbers
```

**Timer Optimization**:
- Uses `font-variant-numeric: tabular-nums` to prevent layout shift
- Monospace font for consistent digit width
- Individual timers for each workflow step

### API Integration
- **Base API client**: `src/lib/api/apiClient.ts`
  - Configured for `localhost:8080` backend (see `src/lib/constants/server.ts`)
  - RESTful methods (GET, POST, PUT, DELETE) with JSON handling
  - Error handling via custom error classes
- **Module-specific APIs**: `src/lib/api/deudApi.ts`
  - Deud module endpoints for task management
- **WebSocket**: Real-time communication via `PUBLIC_WEBSOCKET_URL` environment variable
  - Default: `ws://172.30.1.42/ws/v1/deud` (configured in `.env`)

## Development Guidelines

### Code Conventions
- **Svelte 5 syntax**: Uses modern runes (`$state`, `$derived`, `$props`)
  - No legacy `$:` reactive statements
  - Component props use `$props()` rune
- **TypeScript**: Strict typing enabled throughout
  - `allowJs` and `checkJs` enabled for JS files
  - Module resolution: bundler
- **Component organization**: Barrel exports via `index.ts` files for clean imports
- **Styling**: Scoped component styles with CSS custom properties
  - Glass morphism effects using `backdrop-filter`
  - Gradient backgrounds and animated text
- **Error handling**: Centralized error classes in `src/lib/errors/`
  - Base error class: `ErrorBase`
  - Error handler utility: `errorHandler.ts`

### File Organization
- Components use PascalCase naming
- Utilities and services use camelCase
- Types are defined in dedicated `types/` directories per module
- Store files end with `Store.ts`
- Service files end with `Service.ts`

### State Management
- Uses Svelte's built-in reactivity with stores
- Module-specific stores (e.g., TaskStore, TimerStore) 
- Global notification store for UI feedback

## Important Notes

### Configuration
- **Backend API**: Expected at `localhost:8080` (configured in `src/lib/constants/server.ts`)
- **WebSocket**: Configured via `PUBLIC_WEBSOCKET_URL` in `.env` file
- **Prerendering**: Root layout uses `export const prerender = true`

### Technical Details
- **UI Design**: Custom glass morphism aesthetic with backdrop filters
- **Internationalization**: Mixed Korean/English UI labels (primarily Korean)
- **Navigation**: 6 main modules defined in `src/routes/+layout.ts`:
  - `/deud` - 대응답
  - `/stub` - Stub (multi-customer data loading)
  - `/bxm5` - BXM5
  - `/bxm4` - BXM4
  - `/diff` - Diff
  - `/utils` - Utils

### Development Notes
- Uses ESLint flat config format (eslint.config.js)
- Prettier integration with both standalone and ESLint plugin
- TypeScript parser for .svelte files via typescript-eslint
- Static assets in `static/` directory (images, etc.)
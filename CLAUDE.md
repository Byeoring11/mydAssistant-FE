# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit frontend application called "pp-frontend" that serves as a "Mydata Assistant" - a multi-tool web application with specialized modules for data processing and analysis tasks.

## Development Commands

- **Development server**: `npm run dev` (runs on host 0.0.0.0:5173)
- **Build**: `npm run build`
- **Preview production**: `npm run preview`
- **Type checking**: `npm run check` or `npm run check:watch` (for watch mode)
- **Formatting**: `npm run format` (Prettier)
- **Linting**: `npm run lint` (ESLint + Prettier check)

Always run `npm run lint` and `npm run check` after making changes to ensure code quality and type safety.

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

**Multi-Module Application**: The app has a sidebar navigation with 5 main modules:
- **대응답 (deud)**: Response data loading automation with WebSocket real-time updates
- **BXM5/BXM4**: Data processing modules  
- **Diff**: File/data comparison utilities
- **Utils**: General purpose utilities

**Real-time Features**: The deud module includes WebSocket services for real-time task monitoring and timer functionality.

**UI/UX Elements**:
- Glass morphism design with backdrop filters
- Gradient backgrounds and text effects
- Interactive background toggle with team member image
- Smooth page transitions with crossfade animations
- Floating notification system

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

### API Integration
- Base API client in `src/lib/api/apiClient.ts` 
- Currently configured for `localhost:8080` backend
- RESTful methods (GET, POST, PUT, DELETE) with JSON handling
- Specific deud API functions in `deudApi.ts`

## Development Guidelines

### Code Conventions
- **Svelte 5 syntax**: Uses modern runes (`$state`, `$derived`, `$props`)
- **TypeScript**: Strict typing throughout the application
- **Component organization**: Barrel exports via index.ts files
- **Styling**: Scoped component styles with CSS custom properties
- **Error handling**: Centralized error classes and handlers

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

- The application uses a custom glass morphism UI design
- Backend API is expected at localhost:8080
- WebSocket connections are used for real-time updates in the deud module
- The app includes Korean language content for UI labels
- Environment variables are configured in `.env` file (WebSocket URLs)
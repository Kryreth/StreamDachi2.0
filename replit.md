# StreamDachi - Twitch AI Integration Platform

## Overview
StreamDachi is a Twitch integration application designed to enhance live streams with AI-powered voice features, real-time chat monitoring, and AI-driven chat analysis. It tracks user profiles (VIPs, moderators, subscribers), automates shoutouts, and logs all chat activity. A core feature is its AI user learning engine, providing personalized responses and configurable settings, alongside a hands-free voice AI system with continuous listening, automatic AI rephrasing via Groq, and unlimited free high-quality TTS using Puter.js. The platform includes a comprehensive dashboard with "Today" vs "What You Missed" activity tracking, toggleable stat cards, stream session management, and a Database Viewer for internal data management with CSV export. The VIP Management page features a "Test Shoutout" to preview VIP clips. The UI boasts a dark-themed dashboard with a distinctive Twitch aesthetic.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
StreamDachi utilizes a React with TypeScript frontend built with Vite, leveraging Shadcn UI (New York variant) and Radix UI for a dark-first design featuring Twitch-inspired purple accents. State management is handled by TanStack Query and WebSockets for real-time updates, while Wouter manages client-side routing. Styling is done with Tailwind CSS, and Recharts is used for data visualization.

The backend is an Express.js server with TypeScript, providing RESTful APIs and a WebSocket server. It employs a dual-mode database system with Drizzle ORM, automatically switching between Neon PostgreSQL for production (Replit environment) and SQLite for local development. Key tables include `user_profiles`, `chat_messages`, `ai_analysis`, and `settings`. Real-time communication is powered by a WebSocket server. Architectural decisions prioritize WebSocket for real-time updates, Drizzle ORM for type-safe operations, clear separation of concerns, and an asynchronous AI analysis pipeline. A periodic AI learning engine analyzes user chat history for personalized responses. The system features an auto-shoutout system for VIPs, per-stream chat logging, and a comprehensive StreamDachi Voice AI with configurable behavior, continuous voice recognition, Groq-powered rephrasing, and Puter.js TTS.

Key features include a configurable DachiStream interval, a redesigned Monitor page with modules for status collection, collected messages, and AI responses. It supports global Twitch user search for VIP management, an AI provider switch to GroqCloud (using models like Llama 3.3 70B Versatile), and automatic sending of AI responses to chat. VIP management includes autocomplete with profile pictures, follower counts, live streaming status, shoutout cooldowns, and a "Test Shoutout" feature. A dedicated Raid Management system supports incoming and outgoing raids. The StreamDachi Voice AI system provides hands-free continuous voice-to-text with automatic AI rephrasing (using llama-3.1-8b-instant), continuous listening, and logging of responses. A dual audio system integrates Puter.js for AI voice TTS and Web Speech API for VIP shoutout audio. The Live Chat page offers a clean, authentic Twitch experience, with all sentiment analysis moved to the Analytics tab. The Dashboard features "Today" vs "What You Missed" tabs with clickable, filterable stat cards. A Database Viewer page provides searchable user tables, role-based filtering, and CSV export. Moderation actions (bans, timeouts, deletions) are fully logged and integrated into the dashboard and database viewer. A dedicated Audio Settings page consolidates all voice and audio configurations.

## External Dependencies
*   **Twitch Integration**: `tmi.js` for IRC and chat, Twitch Helix API for user search, OAuth, raid commands, follower/stream status, and clip fetching.
*   **GroqCloud AI Integration**: `groq-sdk` with models like Llama 3.3 70B Versatile, Llama 3.1 70B, Mixtral 8x7B, Llama 3.1 8B Instant, and Gemma 2 9B for sentiment analysis, toxicity detection, message categorization, custom commands, and AI learning.
*   **Database**: Dual-mode system with Neon Serverless PostgreSQL (`@neondatabase/serverless`) for Replit and SQLite (`better-sqlite3`) for local development, managed by Drizzle ORM with automatic environment detection.
*   **UI Component Libraries**: Radix UI (primitives), Heroicons, React Icons, Recharts (data visualization).
*   **Puter.js**: Free unlimited Text-to-Speech (TTS) using Neural and Generative quality engines for AI voice output.

## Local Development Setup
StreamDachi supports dual-mode operation with automatic environment detection. The system seamlessly switches between PostgreSQL (Replit/production) and SQLite (local development) with zero configuration required. Local development features include:

*   **One-Click Launchers**: `START_LOCAL.bat` (Windows) and `run_local.sh` (Mac/Linux) for instant local testing with automatic dependency installation and SQLite database creation.
*   **Visual Studio Code Integration**: Pre-configured `.vscode` folder with tasks.json, launch.json, and settings.json. Press F5 to start with full debugging support, breakpoints, and integrated terminal.
*   **Database Auto-Detection**: Uses `process.env.REPLIT` to automatically select PostgreSQL or SQLite with identical schema across both systems.
*   **Offline Capability**: Local SQLite database (`app.db`) enables development without cloud database dependency while maintaining full feature parity.
*   **Comprehensive Documentation**: `QUICK_START.md`, `LOCAL_SETUP.md`, `VSCODE_SETUP.md`, and `CLEANUP_REPORT.md` provide complete setup and troubleshooting guides.

## Recent Updates
*   **November 5, 2025**: Added dual-mode database system with automatic PostgreSQL/SQLite switching, VS Code integration with F5 debugging support, one-click local launchers, and comprehensive local development documentation. Completed codebase cleanup scan confirming production-ready quality with zero dead code or unused imports.
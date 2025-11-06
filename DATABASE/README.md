# StreamDachi Local Database Storage

This folder stores organized user data in local mode:

- **users/{userId}/**: Individual user folders
  - profile.json: User profile data
  - messages.json: All messages from this user
  - vibe_summaries/: Daily vibe analysis reports
    - index.json: Quick index of all reports
    - YYYY-MM-DD.json: Individual daily reports

- **sessions/**: Stream session data
- **analytics/**: Global analytics and reports

## Automatic Synchronization
All database writes are automatically backed up to this folder structure.


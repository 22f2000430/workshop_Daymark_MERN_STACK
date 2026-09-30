# Initial Coding-Agent Prompt

Copy the prompt below into your coding agent after opening this repository.

---

You are implementing **Daymark**, a study planner using the MERN stack. Start by reading `ARCHITECTURE.md` and inspecting the existing workspace. The root `index.html` is a visual-only prototype: keep it intact as a reference and build the actual application in `client/` and `server/`.

## Goal

Deliver a runnable, tested MVP with a React/Vite client, Node/Express REST API, MongoDB/Mongoose persistence, and authenticated user accounts. Use JavaScript unless the repository already establishes another convention. Follow the architecture document for data shapes, endpoints, date handling, authentication, security, folder layout, and acceptance criteria.

## MVP Features

- Register, log in, restore the current session after refresh, and log out.
- Create, edit, complete/reopen, filter, and delete dated study tasks.
- Create and edit subjects; assign subjects to tasks.
- Today and week planner views, subject progress, and weekly focus insights.
- A focus timer with start, pause, resume, reset, duration selection, and a completed session recorded to the API.
- Responsive, accessible desktop and mobile layouts with loading, empty, validation, and error states.

Use the existing prototype as visual inspiration, not as a source of production state or behavior. Preserve its warm neutral canvas, orange accent, subject colors, compact planner layout, and responsive navigation while building reusable React components. Do not add marketing or onboarding pages beyond the required authentication screens.

## Working Instructions

1. Inspect the repository and its current scripts before changing files. Keep the implementation in the existing workspace; do not overwrite or delete `index.html`.
2. Create a root setup with clear client/server development scripts, `.env.example`, and a `README.md`. Never write real credentials into tracked files.
3. Implement the API and security boundaries first: environment validation, Mongo connection, Mongoose models, Zod request validation, password hashing, signed JWT `HttpOnly` cookies, ownership-scoped queries, and centralized safe error handling. Do not trust a client-provided `userId`.
4. Implement the client against the real API; do not substitute mock data or localStorage persistence for server-backed tasks, subjects, or sessions. Keep only transient UI state and timer state in the browser.
5. Add focused tests for auth, validation, user ownership, task status changes, and focus-session persistence. Add client tests for important form or task interactions where practical.
6. Run the tests and production builds. Fix failures caused by your changes; report any environmental blockers instead of claiming they passed.
7. Finish with a concise summary of the delivered features, exact setup/run commands, required environment variables, tests/builds run, and any known limitations.

## Acceptance Checks

- The documented install and run commands work from a clean checkout after environment variables and MongoDB are configured.
- A newly registered user can create a subject and task, refresh, and still see them.
- A second user cannot read, change, or delete the first user's records, even when given their record IDs.
- Completing a task and finishing a focus session update the relevant weekly progress.
- Date-only tasks stay on the selected day and do not shift because of UTC conversion.
- The interface works with keyboard navigation and remains usable on a narrow mobile viewport.

Work in small, verifiable increments. If an architecture decision is genuinely blocked by the existing repository, state the conflict and choose the smallest secure solution consistent with `ARCHITECTURE.md`; do not silently expand the product scope.

Mongo DB
UserName
22f2000430_db_user
password
YjUnSdicZ6nmiBra

then need to commit to github and render
---

# Tweeter

Tweeter is a simplified social app (BYU CS 340): users, short public statuses, stories, follows, and feeds. The repo is an npm workspace with two modules today.

- `tweeter-shared` — domain types (`User`, `Status`, `AuthToken`, `Follow`, `PostSegment`) and `FakeData`. Anything the client and a future server both need lives here. Export new shared types from `tweeter-shared/src/index.ts` by name.
- `tweeter-web` — React + Vite client. Views in `src/components`, presenters in `src/presenter`, application logic in `src/model.service`.

The UI is functional and uses dummy data inside the service classes. The target is for those services to call the server described in [reference/architecture.md](reference/architecture.md).

## Where to read more

- [reference/domain.md](reference/domain.md) — users, statuses, stories, follows, feeds
- [reference/requirements.md](reference/requirements.md) — session, status, and follow behavior, plus UI rules
- [reference/architecture.md](reference/architecture.md) — current client layers, and the target server and network layout

## Working in this repo

Views only display output and receive input. Presenters own validation, paging, and service calls, and update the view through a view interface. Services own data access. Presenters do not touch the DOM; services do not render UI.

Extend the existing presenter bases (`Presenter`, `MessagePresenter`, `AuthenticationPresenter`, `PagedItemPresenter`) instead of copying try/catch, auth-then-navigate, or paging logic. Page size is 10.

From `tweeter-web`: `npm start` runs the app, `npm run build` typechecks and builds, `npm test` runs Jest. After changing `tweeter-shared`, build that module, then build `tweeter-web`. Tests live in `tweeter-web/test`. Presenter tests use ts-mockito. Component tests use React Testing Library. Mock `useUserInfo` with Jest when a component under test needs a current user and auth token.

## Avoid Code Duplication at all costs

User the following patterns when writing or reviewing code in order to remove and reduce code duplication:

- Generics
- Inheritance
- Composition
- Template Method
- Pass in functions

## AI attribution

After each task that changes files, append an entry to
AI-ATTRIBUTION.md in the repository root, creating the file if it does
not exist. Use this format, with today's date:

## YYYY-MM-DD: <each file changed, with (new file) after new ones>

- Tool: <tool name>
- Task: <the task I gave you, in one or two sentences>
- Review: TODO
  Leave the Review line as TODO. I fill it in after I review the change.
  List every file you changed or created, including tests, and do not
  list anything you did not change.
  If a TypeScript file you created or changed does not already start
  with this line, add it as the first line:
  // AI-assisted: see AI-ATTRIBUTION.md

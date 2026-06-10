# Task 2-b: Auth Store Agent Work Record

## Task
Create a Zustand store for authentication state management.

## Completed
- Created `/home/z/my-project/src/lib/auth-store.ts` with:
  - `User` interface export (`{ id, email, name }`)
  - `AuthState` interface with full typing
  - `useAuthStore` Zustand store with `create` pattern
  - State: `user`, `isLoading`, `isAuthenticated`, `showLoginDialog`
  - Actions: `login`, `register`, `logout`, `setShowLoginDialog`
  - Used `sonner` for toast notifications
  - Proper error handling with try/catch
  - Lint passes cleanly

## Notes
- `isAuthenticated` is set alongside `user` rather than computed, for simplicity with Zustand
- `showLoginDialog` is auto-set to `false` on successful login/register

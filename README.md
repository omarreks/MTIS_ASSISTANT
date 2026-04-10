# MTIS Assistant

MTIS Assistant is a modern academic intelligence design system. It features a React-based frontend and an Express-based backend, with shared TypeScript types and constants.

## Prerequisites

- Node.js (v18 or later recommended)
- pnpm (v10 or later recommended)

## Installation

Run the following command to install dependencies:

```bash
pnpm install
```

## Development

To start the development environment:

```bash
pnpm run dev:all
```

This will concurrently run the frontend (Vite) and backend (server).

## Build

To build the project for production:

```bash
pnpm run build
```

## Testing

To run tests:

```bash
pnpm test
```

## Scripts

- `dev`: Starts the backend server in development mode.
- `build`: Builds the frontend and backend for production.
- `start`: Starts the production server.
- `check`: Runs TypeScript checks.
- `test`: Runs the test suite.
- `dev:all`: Starts both the frontend and backend concurrently for development.

## File Structure

- `client/`: Frontend code (React, Vite).
- `server/`: Backend code (Express, TRPC).
- `shared/`: Shared TypeScript types and constants.
- `drizzle/`: Database migrations and schema.

## License

MIT License.
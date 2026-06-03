# Coding Standards: BayanFund-StellarX

## General
- **Language**: TypeScript for frontend/backend, Rust for Soroban contracts.
- **Style**: clean, modular, and well-documented.
- **Consistency**: Follow existing patterns for naming and structure.

## Frontend (React/Next.js)
- Use functional components and hooks.
- Keep components small and focused.
- Prefix custom hooks with `use`.
- Use CSS Modules or Utility-first CSS for styling.
- Handle all loading and error states for blockchain calls.

## Smart Contracts (Rust/Soroban)
- Follow the official Soroban SDK patterns.
- Keep state storage efficient to minimize costs.
- Use descriptive error codes.
- Ensure all public functions have appropriate authorization checks.
- Document every contract function.

## Git & Workflow
- Use descriptive commit messages.
- Do not commit secrets or `.env` files.
- Keep pull requests focused on a single feature or fix.

# Next.js & Code Quality Rules — Pulse8

## Directives
1. **App Router Conventions**: Keep client components interactive (`"use client"`) at component leaves when possible. Server components for data fetching.
2. **TypeScript Strictness**: Interfaces and types must be explicitly defined. Avoid `any` types.
3. **Form Handling**: Use controlled inputs or React Hook Form with Zod schemas for input validation.
4. **State Management**: Prefer local React component state or URL search params for UI filters; use React Context for App Shell state.
5. **Clean Imports**: Group imports: React/Next -> Third-party UI/Icons -> Internal components -> Types/Utilities.

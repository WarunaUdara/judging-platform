/**
 * Global type declarations for Next.js 16 with React 19
 * 
 * This file ensures DOM types are available during TypeScript checking
 * and fixes React 19 event type compatibility issues.
 */

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Re-export to ensure DOM globals are recognized
declare global {
  // Ensure window is available in client components
  // (TypeScript may not recognize it during Next.js build)
  const window: Window & typeof globalThis;
  const document: Document;
  const navigator: Navigator;
}

// Fix for React 19 ChangeEvent typing
// The intersection type `EventTarget & T` doesn't properly expose T's properties
declare module 'react' {
  interface BaseSyntheticEvent<E = object, C = unknown, T = unknown> {
    target: T;
    currentTarget: C;
  }
}

export {};

# Design System & UI Rules — Pulse8

## Directives
1. **Color Palette**: Use curated HSL semantic tokens (`surface-50` to `surface-950`, `brand-400` to `brand-700`). Avoid default tailwind colors (pure blue, red, green).
2. **Typography**: Headings must use font family `font-display` (Plus Jakarta Sans / Inter). Body uses standard sans-serif (`Inter`).
3. **Glassmorphism & Gradients**: Card panels use dark surface gradients (`bg-gradient-to-br from-surface-900 via-surface-950 to-brand-950`), subtle borders (`border-white/10` or `border-surface-200/80`), backdrop blur (`backdrop-blur-md`).
4. **Icons**: Use `lucide-react` icons exclusively with consistent sizing (`w-4 h-4` or `w-5 h-5`).
5. **Interactive Elements**: Hover effects, smooth transitions (`transition-all duration-200`), active states, accessible focus rings.
6. **No Placeholders**: Render complete data structures, realistic mock metrics, and full component trees.

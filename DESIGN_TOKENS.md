Design Tokens — ZenoPay

This file documents the design tokens (CSS custom properties) used across the ZenoPay frontend and how to use them in Tailwind-driven components.

Colors (CSS variables defined in src/index.css):

- --zeno-primary: 210 100% 50% (example HSL shorthand stored as `h s% l%` in index.css)
- --zeno-primary-foreground: 0 0% 100%
- --zeno-secondary: 250 85% 60%
- --zeno-secondary-foreground: 0 0% 100%
- --zeno-accent: 180 60% 45%
- --zeno-muted: 210 10% 14%
- --zeno-background: 220 12% 18%
- --zeno-foreground: 210 16% 96%
- --zeno-card: 220 12% 10%
- --zeno-card-foreground: 210 16% 96%

Usage examples (CSS):

.zeno-hero {
  background: linear-gradient(135deg, hsl(var(--zeno-primary) / 0.15), hsl(var(--zeno-secondary) / 0.08));
  color: hsl(var(--zeno-foreground));
}

.zeno-cta {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold shadow-sm;
  background: linear-gradient(90deg, hsl(var(--zeno-primary)), hsl(var(--zeno-secondary)));
  color: hsl(var(--zeno-primary-foreground));
}

Tailwind mapping:
The project tailwind.config.ts maps several theme colors to CSS variables (see `extend.colors` in tailwind.config.ts). Use `text-primary`, `bg-primary`, `border`, etc., and they will resolve to the CSS variables in runtime.

Recommendation:
- Prefer using the provided utility classes (zeno-cta, zeno-card, zeno-hero) for quick styling.
- For layout primitives, use Tailwind utilities; for color/brand use CSS variables to maintain theme switching.

Quick reference:
- Primary CTA: use `.zeno-cta` or `bg-primary text-primary-foreground`
- Hero sections: use `.zeno-hero`
- Cards: use `.zeno-card` (wraps padding + subtle bg + border)

If you'd like, I can extract the exact HSL values from `src/index.css` and include them inline here.```
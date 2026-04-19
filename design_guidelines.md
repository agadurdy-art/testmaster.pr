# Testmaster Design Guidelines - iOS 26 Glass Nature Theme

## Core Design Philosophy
A modern, immersive learning experience inspired by iOS 26's liquid glass aesthetic. The design emphasizes depth, clarity, and organic visual flow using layered transparency, soft gradients, and nature-inspired emerald greens.

---

## Color Palette

### Primary Colors
```css
--emerald-primary: #10B981      /* Main interactive elements */
--emerald-light: #D1FAE5        /* Light backgrounds */
--emerald-dark: #059669         /* Hover states */
--emerald-glow: rgba(16, 185, 129, 0.4)  /* Glows and shadows */
```

### Supporting Colors
```css
--sky-accent: #0EA5E9           /* Secondary actions */
--amber-accent: #F59E0B         /* Warnings, stars */
--violet-accent: #8B5CF6        /* Grammar games */
--pink-accent: #EC4899          /* Achievements */
--slate-text: #334155           /* Primary text */
--slate-muted: #64748B          /* Secondary text */
```

### Semantic Colors
```css
--success: #22C55E              /* Correct answers */
--error: #EF4444                /* Wrong answers */
--warning: #F59E0B              /* Hints */
--info: #3B82F6                 /* Tips */
```

---

## Glass Effects

### Glass Card (Primary Container)
```css
.glass-card {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.50);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
}
```

### Glass Panel (Sidebar/Navigation)
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.40);
  backdrop-filter: blur(16px);
  border-right: 1px solid rgba(255, 255, 255, 0.30);
}
```

### Glass Button
```css
.glass-button {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(16, 185, 129, 0.20);
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}
```

---

## Background Mesh Gradient
```css
.bg-mesh {
  background: 
    radial-gradient(at 0% 0%, hsla(152, 100%, 90%, 1) 0px, transparent 50%),
    radial-gradient(at 100% 0%, hsla(190, 100%, 92%, 1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, hsla(37, 100%, 91%, 1) 0px, transparent 50%),
    #F8FAFC;
}
```

---

## Typography

### Font Stack
```css
--font-display: 'Fredoka', 'Comic Sans MS', sans-serif;  /* Headings */
--font-body: 'Nunito', 'Segoe UI', sans-serif;           /* Body text */
```

### Type Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| H1 | 36-48px | 700 | Fredoka |
| H2 | 24-30px | 700 | Fredoka |
| H3 | 18-24px | 600 | Fredoka |
| Body | 16px | 400 | Nunito |
| Small | 14px | 400 | Nunito |
| Caption | 12px | 600 | Nunito |

---

## Spacing System
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

---

## Border Radius
```
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
full: 9999px
```

---

## Shadows

### Emerald Shadow (Primary buttons, success states)
```css
.shadow-emerald {
  box-shadow: 0 10px 20px -10px rgba(16, 185, 129, 0.4);
}
```

### Soft Shadow (Cards, containers)
```css
.shadow-soft {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
```

### Elevated Shadow (Hover states, modals)
```css
.shadow-elevated {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

---

## Animations

### Float Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 20px 5px rgba(16, 185, 129, 0.2); }
}
```

### Shake (Wrong answer)
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
```

---

## Component Guidelines

### Game Cards
- Use `glass-card` as base
- 24px padding
- Emoji icons: 48-64px size with subtle shadow
- Progress bars: 8px height, rounded-full, emerald gradient fill

### Option Buttons
- Idle: `bg-white/70`, `border-white/50`
- Hover: `bg-white`, `border-emerald-200`, slight lift
- Selected: `bg-emerald-50`, `border-emerald-400`
- Correct: `bg-emerald-50`, `border-emerald-500`, green check icon
- Wrong: `bg-red-50`, `border-red-300`, red X icon

### Audio Buttons
- Circular: 48-80px depending on size variant
- Emerald gradient background
- White Volume2 icon
- Hover: scale 1.1
- Active: scale 0.95

### Star Rating
- 3 stars system
- Gold filled: `text-amber-400 fill-amber-400`
- Empty: `text-slate-200`
- Animation: sequential pop with delay

### Progress Indicators
- Linear: `h-2`, `bg-white/50`, emerald fill
- Circular: SVG stroke animation
- Step dots: 8px circles, emerald when active

---

## Stage Color Mapping
| Stage | Primary Color | Light BG | Accent |
|-------|--------------|----------|--------|
| Stage 1 (Pre-A1) | #F59E0B (Amber) | from-amber-50 | Yellow stars |
| Stage 2 (A1) | #10B981 (Emerald) | from-emerald-50 | Green nature |
| Stage 3 (A2) | #3B82F6 (Blue) | from-blue-50 | Ocean vibes |
| Stage 4 (B1) | #8B5CF6 (Violet) | from-violet-50 | Purple depth |
| Stage 5 (B2+) | #F43F5E (Rose) | from-rose-50 | Achievement red |

---

## Accessibility
- Minimum contrast ratio: 4.5:1 for text
- Focus states: 2px solid ring with emerald color
- Touch targets: minimum 44px
- Reduced motion: respect `prefers-reduced-motion`

---

## Dark Mode (Future)
Glass effects should adapt:
- Reduce backdrop blur to 12px
- Darken glass backgrounds to rgba(30, 30, 30, 0.8)
- Maintain emerald accent colors

---

## Implementation Notes
1. Use Tailwind CSS utility classes where possible
2. Custom glass utilities defined in `index.css`
3. Shadcn/UI components from `/components/ui/`
4. Icons: Lucide React library
5. Animations: CSS keyframes preferred over JS

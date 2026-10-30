---
version: "alpha"
name: "Skeuomorphism"
description: "Realistic, textured interface with 3D depth, real-world metaphors (leather, wood, metal), complex gradients (8-12 stops), realistic shadows, grain/texture overlays, tactile press animations. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#087FB5"
  secondary: "#B74345"
  tertiary: "#1D3D52"
  neutral: "#F4F7F9"
typography:
  h1:
    fontFamily: System UI stack
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: System UI stack
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: System UI stack
    fontSize: 0.75rem
    fontWeight: 500
---

## Overview

Realistic, textured interface with 3D depth, real-world metaphors (leather, wood, metal), complex gradients (8-12 stops), realistic shadows, grain/texture overlays, tactile press animations. Ideal for landing pages, saas. AI-ready template. Between 2007 and 2012, Apple's interface design was obsessed with making digital things look real. The Notes app had yellow legal pad lines. Game Center was wrapped in wood grain and green felt. iCal wore stitched leather. Steve Jobs believed that if software looked like something you already understood, you'd trust it faster. And honestly? He was right. People who'd never touched a smartphone knew what a bookshelf full of books meant.

Then Jony Ive took over software in 2013 and burned it all down with iOS 7. The argument was simple: people don't need training wheels anymore. Flat won. Skeuomorphism became a punchline at design conferences for nearly a decade.

But here we are in 2025, and it's back. Not as a copy of the old Apple stuff, but as a deliberate aesthetic choice. Spatial computing needs depth cues that flat design simply cannot provide. VisionOS uses subtle shadows, glass refraction, real lighting. Designers building for AR and mixed reality are rediscovering that texture and dimension aren't decoration. They're wayfinding.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 8/10 — Cinematic

- **Style:** Realistic, Tactile, Textured, Detailed
- **Keywords:** Realistic, texture, depth, 3D appearance, real-world metaphors, shadows, gradients, tactile, detailed, material
- **Era:** 2007-2012 iOS
- **Light/Dark:** ◐ Partial / ◐ Partial

## Colors

The brand palette is based on the blue lettering and coral-red accents in [`baseLogo.png`](./baseLogo.png). Because the reference is a small, blurred photograph, these are approximate digital colors, not exact samples or production color specifications.

### Brand colors

| Token | Color | Use |
|---|---|---|
| Brand blue | `#087FB5` | Primary actions, links, and blue brand lettering |
| Brand blue hover | `#066590` | Hover state for primary actions |
| Brand blue light | `#75C2ED` | Blue accents on dark surfaces |
| Brand coral | `#B74345` | Secondary brand lettering, badges, and highlights |

### Supporting colors

| Token | Color | Use |
|---|---|---|
| Ink | `#1D3D52` | Headings, primary text, and dark contrast |
| Warm paper | `#F5F1E8` | Main light-theme background |
| Warm white | `#FFFDF8` | Main light-theme card surfaces |
| Cool mist | `#E8F0F1` | Secondary surfaces and cool-tinted gradients |
| Amber | `#C78B2D` | Small highlights, section details, and supporting accents |
| Sage | `#5D796D` | Quiet positive accents and secondary emphasis |
| Muted | `#687781` | Secondary text and captions |
| Line | `#DEDBD1` | Borders and subtle separators |

Keep blue and coral as the recognizable brand accents, and use warm paper, cool mist, amber, and sage to add depth without competing with the logo. In dark mode, use warm charcoal (`#182126`), slate teal (`#25343A`), lighter amber (`#E0AD56`), and sage (`#94B5A3`), alongside the lighter brand blue `#20A5E0` and coral `#FF817D`. Maintain readable contrast and use supporting hues selectively. Treat all logo-derived colors as visual guidance until a high-resolution master logo is available.


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Desktop content containers use a 1440px maximum width, centered with 32px side gutters. The vehicle detail view uses a weighted image-and-details split above 900px and stacks below that breakpoint. Mobile layouts use 20px side gutters.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Realistic shadows (layers), depth (perspective), texture details (noise, grain), realistic animations (300-500ms)

- **Page background:** Use a low-contrast, fine-grain dot texture over the paper color. Keep it subtle in both light and dark themes so text and surfaces remain clear.
- **Section transitions:** Use barely noticeable, low-contrast gradients at image-led section edges and where the page meets the darker footer. Avoid visible bands or abrupt color shifts; preserve readable contrast.
- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 540ms ease-out. Staggered cascades for lists: 120ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Realistic textures applied
- Do Complex gradients 8-12 stops
- Do Multi-layer shadows
- Do Texture overlays present
- Do Tactile animations smooth
- Do Depth effect pronounced

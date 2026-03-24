# Design System — CampCalendar

## Product Context
- **What this is:** A summer camp planning web app — calendar-first tool with community-sourced camp data
- **Who it's for:** Working parents with 2+ kids (ages 5-13) who must fill every summer week with camp/childcare coverage
- **Space/industry:** Family planning tools, childcare logistics
- **Project type:** Web app (responsive, desktop-primary for planning, mobile for reference)

## Aesthetic Direction
- **Direction:** Playful-Clean — light, breathable, rounded but not bubbly
- **Decoration level:** Minimal — typography and color do the work. No gradients, decorative blobs, or illustrations
- **Mood:** Calm planning surface where kid colors do the heavy lifting. Trustworthy, clear at a glance, faster than paper. Google Calendar's restraint meets the warmth of a family product.
- **Core principle:** The app shell stays neutral so the kid colors pop. Color IS the information.

## Typography
- **Display/Hero:** Plus Jakarta Sans (800 weight) — geometric but warm, not clinical
- **Body:** Plus Jakarta Sans (400/500) — one font family keeps it cohesive
- **UI/Labels:** Plus Jakarta Sans (600, 12-13px)
- **Data/Tables:** Geist (tabular-nums) — for costs, dates, numbers in the calendar
- **Code:** Geist Mono
- **Loading:** Google Fonts CDN — `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap`
- **Scale:** 12px / 14px / 16px / 20px / 24px / 32px / 48px

## Color
- **Approach:** Restrained shell + expressive kid colors
- **Background:** `#FAFAF8` (warm off-white)
- **Surface:** `#FFFFFF` (cards, panels)
- **Border:** `#E8E5E0` (warm gray)
- **Text primary:** `#1A1A1A`
- **Text muted:** `#6B6B6B`
- **Accent:** `#2563EB` (reliable blue — buttons, links, focus rings)
- **Accent hover:** `#1D4ED8`
- **Semantic:**
  - Success: `#16A34A`
  - Warning/Vacation: `#F59E0B`
  - Error/Gap: `#DC2626`
  - Info: `#2563EB`
- **Kid palette** (8 pre-set, user picks per kid):
  1. `#E74C3C` (red)
  2. `#3498DB` (blue)
  3. `#2ECC71` (green)
  4. `#9B59B6` (purple)
  5. `#F39C12` (orange)
  6. `#1ABC9C` (teal)
  7. `#E67E22` (dark orange)
  8. `#E84393` (pink)
- **Dark mode:** Reduce surface lightness, keep kid colors at full saturation. Background `#141413`, Surface `#1E1E1C`, Border `#2E2E2A`, Text `#F5F5F3`

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — calendar cells need breathing room (cramped = stressful)
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Grid-disciplined — strict columns for calendar grid, clean sidebar for camp search
- **Grid:** 12 columns on desktop, 4 on mobile
- **Max content width:** 1280px
- **Border radius:** sm: 6px (inputs, buttons), md: 10px (cards, panels), lg: 16px (modals, dialogs), full: 9999px (kid color pills, filter chips)

## Motion
- **Approach:** Minimal-functional — smooth transitions that aid comprehension, no bouncy animations
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150ms) medium(250ms) long(400ms)
- **Transitions:** View changes (150ms ease-out), hover states (100ms), modals (250ms ease-out)

## Key UI Patterns
- **Kid color pills:** `border-radius: 9999px`, white text on kid color background, used in header and as tags
- **Gap warnings:** Red dashed border (`1px dashed #DC2626`) + light red background pattern (diagonal stripes)
- **Coverage bar:** Horizontal track per kid showing filled (kid color), vacation (amber), and gap (dashed pattern) segments
- **Camp blocks on calendar:** Rounded rectangles (`border-radius: 3px`) in kid's color, white text, truncated with ellipsis
- **Filter chips:** Pill-shaped toggles, inactive = gray border, active = dark fill with white text

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-03-24 | Initial design system created | Created by /design-consultation. Playful-Clean aesthetic with restrained shell + expressive kid colors. Plus Jakarta Sans + Geist typography stack. |
| 2024-03-24 | Kid colors as primary design element | Most planning apps use one accent. CampCalendar uses color as information — each kid has a distinct color that dominates the calendar view. |
| 2024-03-24 | Gap warnings as first-class UI | Red dashed borders + coverage bar make uncovered weeks impossible to miss. This is the core value proposition visualized. |

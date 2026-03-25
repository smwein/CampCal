# Interactive Calendar & Camp Management

Completes the core planning loop: parents can now manage camps, fill gaps interactively, and mark time off — all from the calendar view.

## Context

CampCalendar has a working summer overview grid showing camps, vacations, and gaps per kid. But nothing is clickable. Once a camp is saved, it can't be edited or deleted. Coverage overrides (vacation, no-coverage-needed) have DB support but no UI.

These three features close the loop so parents can plan an entire summer without leaving the dashboard.

## Feature 1: Interactive Calendar with Gap Actions

### Behavior

Every cell in the `SummerOverview` grid becomes clickable. A popover anchored to the clicked cell shows context-appropriate actions.

**Gap cell popover:**
- "Add Camp" — navigates to `/dashboard/camps/new?kid={kidId}&week={weekStart}`, pre-filling the kid selector and start date
- "Mark Vacation" — inline form: label text field + Save button. Creates a `coverage_override` with type `vacation`
- "No Coverage Needed" — single click. Creates a `coverage_override` with type `no_coverage_needed`

**Camp cell popover:**
- Shows camp name, dates, category, cost
- "Edit" — navigates to `/dashboard/camps/[id]/edit`
- "Remove Assignment" — confirms, then deletes the assignment (not the camp itself)

**Vacation/override cell popover:**
- Shows label and type
- "Remove" — deletes the `coverage_override`

### Popover implementation

Plain positioned `div`, no external library. Positioned below the clicked cell (or above if near bottom of viewport). Dismisses on click-outside or Escape key.

### Data flow

Popover actions call Supabase directly from the client component. After any mutation, call `router.refresh()` to re-fetch server component data.

### Pre-fill logic for "Add Camp"

The `camps/new` page reads `kid` and `week` query params on mount. If present:
- Pre-selects the kid in the kid picker
- Sets start date to the Monday of that week
- Sets end date to the Friday of that week

## Feature 2: Camp & Assignment Management

### Camp list page: `/dashboard/camps`

Lists all camps created by the user. Each camp card shows:
- Camp name, organization
- Date range (earliest session start to latest session end)
- Category badge
- Cost per week
- Kid color pills for each assigned kid

Actions per camp:
- "Edit" — navigates to `/dashboard/camps/[id]/edit`
- "Delete" — confirm dialog, then cascading delete: camp + sessions + assignments

### Camp edit page: `/dashboard/camps/[id]/edit`

Reuses the same form layout as `camps/new`, pre-populated with existing data. The kid picker allows changing or adding kid assignments for the session. Save updates camp, session, and assignment records.

### Nav update

Add "Camps" link to `DashboardNav` between the kid pills area and the user name/sign-out area.

### Data flow

Edit page is a server component that loads camp + sessions + assignments, passes to a client form component. Form submits via client-side Supabase calls, then redirects to `/dashboard`.

## Feature 3: Coverage Overrides UI

### Bulk "Mark Time Off" modal

Triggered by a "Mark Time Off" button on the dashboard (next to "+ Add Camp"). Modal contains:
- Kid picker: select individual kid(s) or "All Kids"
- Start date + end date
- Type dropdown: "Vacation" or "No Coverage Needed"
- Optional label (e.g. "Family trip to Maine")

Save creates one `coverage_override` row per selected kid.

### Visual distinction

- Vacation weeks: amber background (existing behavior)
- "No Coverage Needed" weeks: solid light gray background (`#E8E5E0` at 50% opacity) — distinguishes "we have plans" from "we chose not to cover this"

### Override management

Handled entirely through the calendar popover (Feature 1). No separate overrides list page — clicking a vacation or override cell on the calendar shows the label and a "Remove" action.

## Files to create or modify

**New files:**
- `src/app/dashboard/camps/page.tsx` — camp list
- `src/app/dashboard/camps/[id]/edit/page.tsx` — camp edit
- `src/app/dashboard/components/cell-popover.tsx` — reusable popover for calendar cells
- `src/app/dashboard/components/time-off-modal.tsx` — bulk override modal

**Modified files:**
- `src/app/dashboard/components/summer-overview.tsx` — make cells clickable, integrate popover
- `src/app/dashboard/components/dashboard-nav.tsx` — add "Camps" nav link
- `src/app/dashboard/page.tsx` — add "Mark Time Off" button
- `src/app/dashboard/camps/new/page.tsx` — read query params for pre-fill
- `src/lib/coverage.ts` — add `no_coverage_needed` type handling + gray color

## Out of scope

- Drag-and-drop camp reassignment
- Camp search/browse (community camps)
- Multi-session per camp (keep current 1:1 camp:session model)
- Budget/cost summary view
- Mobile-optimized interactions

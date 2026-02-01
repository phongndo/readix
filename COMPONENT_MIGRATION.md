# Bits UI Migration Mapping - Readix

## Migration Progress

**Phase 1: Base Wrappers** - ✅ COMPLETE (5 components)
**Phase 2: Atoms Migration** - ✅ COMPLETE (5 components + 9 file imports updated)
**Phase 3: Molecules Migration** - 🟡 In Progress
**Phase 4: Organisms Migration** - 🟡 In Progress
**Phase 5: Templates** - N/A

---

## Migration Strategy: Incremental (Phase-by-Phase)

---

## Phase 1: Base Wrappers ✅ COMPLETE

Create Bits UI wrappers in `src/lib/components/ui/` to provide clean atomic interface.

### 1.1 Button

**Status:** ✅ COMPLETE
**Completion Note:** All 9 button import sites updated to use `src/lib/components/ui/button/button.svelte`

- **Current:** `src/lib/components/atoms/button/button.svelte` (custom)
- **New:** `src/lib/components/ui/button/button.svelte` (wraps Bits UI)
- **API Compatibility:** ✅ 100% compatible
- **Props Mapping:**
  - `variant` (primary|secondary|outline|ghost|destructive) → Maps to Bits UI + Tailwind
  - `size` (sm|md|lg|icon|icon-sm|icon-lg) → Maps to Bits UI + Tailwind
  - `disabled` → Native Bits UI prop
  - `href` → Uses Bits UI asChild pattern with `<a>`
  - `onclick` → Bits UI onClick
- **Changes:** None - drop-in replacement
- **Styling:** Keep existing Tailwind variants from buttonVariants

### 1.2 Input

**Status:** ✅ COMPLETE
**Completion Note:** search-input.svelte enhanced with Bits UI Input primitive

- **Current:** Native HTML input with custom styling
- **New:** `src/lib/components/ui/input/input.svelte` (wraps Bits UI Input)
- **API:**
  - `value` (bindable) → Bits UI value
  - `placeholder` → Bits UI placeholder
  - `disabled` → Bits UI disabled
  - `type` (text|password|email|url|number) → Bits UI type
  - `error` → Custom styling + aria-invalid
  - `oninput` → Bits UI onInput
  - `onchange` → Bits UI onChange
- **Benefits:** Better focus management, form integration, accessibility

### 1.3 Label

**Status:** ✅ COMPLETE

- **Current:** Native HTML label
- **New:** `src/lib/components/ui/label/label.svelte` (wraps Bits UI Label)
- **API:**
  - `for` → Bits UI for
  - `children` → Slot content
- **Benefits:** Automatic form association, better accessibility

### 1.4 Dialog

**Status:** ✅ COMPLETE
**Completion Note:** upload-modal.svelte migrated from custom modal to Bits UI Dialog + Tabs

- **Current:** Custom modal implementation in `upload-modal.svelte`
- **New:** `src/lib/components/ui/dialog/dialog.svelte` (wraps Bits UI Dialog)
- **Components:**
  - `Dialog.Root` - Container with open state
  - `Dialog.Trigger` - Button to open
  - `Dialog.Portal` - Renders outside DOM tree
  - `Dialog.Overlay` - Backdrop
  - `Dialog.Content` - Modal content
  - `Dialog.Header` - Title area
  - `Dialog.Title` - Accessible title
  - `Dialog.Description` - Accessible description
  - `Dialog.Close` - Close button
- **Benefits:** Focus trap, scroll lock, escape key handling, aria attributes

### 1.5 Select

**Status:** ✅ COMPLETE
**Completion Note:** sort-dropdown.svelte migrated to Bits UI Select

- **Current:** Custom dropdown in `sort-dropdown.svelte`
- **New:** `src/lib/components/ui/select/select.svelte` (wraps Bits UI Select)
- **Components:**
  - `Select.Root` - Container
  - `Select.Trigger` - Button to open
  - `Select.Value` - Display selected value
  - `Select.Content` - Dropdown content
  - `Select.Item` - Individual option
- **Benefits:** Keyboard navigation, typeahead, accessibility, portal rendering

---

## Phase 2: Atoms Migration ✅ COMPLETE

Replace 8 atoms with Bits UI equivalents where beneficial.

**Phase 2 Completion Summary:**

- ✅ search-input migrated to Bits UI Input
- ✅ upload-modal migrated to Dialog + Tabs
- ✅ filter-tabs migrated to Bits UI Tabs
- ✅ sort-dropdown migrated to Bits UI Select
- ✅ Button imports updated across 9 files

### 2.1 file-input → FileInput

**Priority:** HIGH
**Status:** 🟡 Ready for Phase 1 POC

- **Current:** Custom file input with click() method
- **Bits UI:** `FileInput` primitive
- **Benefits:** Drag & drop support, better file validation, accessibility
- **API Changes:**
  - Keep: `accept`, `multiple`, `onSelect`
  - Add: `onDragOver`, `onDragLeave`, `onDrop` events
  - Remove: `click()` method (use Bits UI trigger pattern)

### 2.2 search-input → Input

**Priority:** HIGH
**Status:** ✅ COMPLETE

- **Current:** Custom input with debounce
- **Bits UI:** `Input` with built-in features
- **Decision:** Keep debounce logic, wrap Bits UI Input
- **Benefits:** Better focus management, clear button integration
- **Completion Note:** Migrated to use Bits UI Input primitive with preserved debounce functionality

### 2.3 drop-zone → DropZone

**Priority:** MEDIUM

- **Current:** Custom drop zone implementation
- **Bits UI:** `DropZone` primitive available
- **Benefits:** Better drag state handling, file validation, accessibility

### 2.4 button → Button (DONE in Phase 1)

**Priority:** COMPLETED

### 2.5 progress-bar → Keep Custom

**Priority:** LOW

- **Decision:** No Bits UI equivalent, keep custom implementation
- **Reason:** Simple component, already minimal

### 2.6 card-container → Keep Custom

**Priority:** LOW

- **Decision:** Keep custom implementation
- **Reason:** Pure presentational, no interactivity needed

### 2.7 icon-circle → Keep Custom

**Priority:** LOW

- **Decision:** Keep custom implementation
- **Reason:** Pure presentational wrapper

### 2.8 stat-value → Keep Custom

**Priority:** LOW

- **Decision:** Keep custom implementation
- **Reason:** Pure presentational text display

---

## Phase 3: Molecules Migration

Compose Bits UI atoms into molecules.

### 3.1 form-field

**Priority:** HIGH

- **Current:** Label + Input/textarea + Error (custom)
- **New:** Bits UI Label + Bits UI Input + Bits UI Field
- **Components:**
  - Use `Field` primitive for error states
  - Use `Label` for automatic association
  - Use `Input` for better form integration
- **Benefits:** Automatic aria-describedby, error association, required field handling

### 3.2 filter-tabs

**Priority:** HIGH
**Status:** ✅ COMPLETE (Phase 2)

- **Current:** Custom tabs using native buttons
- **New:** Bits UI Tabs
- **Components:**
  - `Tabs.Root` - Container with value state
  - `Tabs.List` - Tab buttons container
  - `Tabs.Trigger` - Individual tab button
  - `Tabs.Content` - Tab panel content
- **Benefits:** Keyboard navigation (arrow keys), automatic aria attributes
- **Completion Note:** Migrated to Bits UI Tabs in upload-modal.svelte during Phase 2

### 3.3 search-bar

**Priority:** MEDIUM

- **Current:** Input with search icon + clear button
- **New:** Bits UI Input with leading/trailing slots
- **Decision:** Enhance current with Bits UI Input primitive

### 3.4 file-upload-zone

**Priority:** MEDIUM

- **Current:** Custom drop zone with file display
- **New:** Bits UI DropZone + FileInput
- **Components:** Combine DropZone for drag-drop + FileInput for click selection

### 3.5 sort-dropdown

**Priority:** MEDIUM
**Status:** ✅ COMPLETE (Phase 2)

- **Current:** Custom dropdown
- **New:** Bits UI Select
- **Benefits:** Better keyboard navigation, typeahead
- **Completion Note:** Migrated to Bits UI Select in library-toolbar during Phase 2

### 3.6 stat-card

**Priority:** LOW

- **Current:** Card + icon + value + label
- **Decision:** Keep as composition, just update imports

### 3.7 empty-search-state

**Priority:** LOW

- **Current:** Icon + text + button
- **Decision:** Keep as composition, just update imports

### 3.8 search-bar

**Priority:** LOW

- **Current:** Input + icon + clear button
- **Decision:** Keep structure, wrap with Bits UI Input

---

## Phase 4: Organisms Migration

Update organisms to use new molecules and atoms.

### 4.1 upload-modal

**Priority:** HIGH
**Status:** ✅ COMPLETE (Phase 2)

- **Current:** Custom modal overlay
- **New:** Bits UI Dialog
- **Changes:**
  - Replace custom overlay with Dialog.Overlay
  - Replace custom content container with Dialog.Content
  - Add Dialog.Title for accessibility
  - Add Dialog.Description for context
  - Keep form fields, update to use new form-field molecule
- **Benefits:** Focus trap, escape handling, scroll lock
- **Completion Note:** Fully migrated to Bits UI Dialog + Tabs during Phase 2

### 4.2 book-card

**Priority:** LOW

- **Current:** Card with book info + progress
- **Decision:** Keep structure, update imports only
- **Changes:** Use new card-container atom import

### 4.3 book-grid

**Priority:** LOW

- **Current:** Grid layout of book cards
- **Decision:** Keep as layout component
- **Changes:** Update book-card import

### 4.4 contribution-calendar

**Priority:** LOW

- **Current:** Custom calendar heatmap
- **Decision:** Keep custom implementation
- **Reason:** Specialized component, no Bits UI equivalent

### 4.5 library-toolbar

**Priority:** MEDIUM

- **Current:** Search + filter tabs + sort dropdown
- **Decision:** Compose new molecules
- **Changes:**
  - Replace search-bar with new version
  - Replace filter-tabs with new version
  - Replace sort-dropdown with Select

### 4.6 main-header

**Priority:** LOW

- **Current:** Header with navigation
- **Decision:** Keep, may add Bits UI NavigationMenu later

### 4.7 stats-grid

**Priority:** LOW

- **Current:** Grid of stat cards
- **Decision:** Keep as layout, update imports

---

## Phase 5: Templates

No changes needed - templates are layout shells.

---

## New Components to Add (Optional)

### PIN Input

**Use Case:** Verification codes, 2FA
**Bits UI:** `PinInput` primitive available
**Location:** `src/lib/components/atoms/pin-input/pin-input.svelte`

### Slider

**Use Case:** Progress scrubbing, volume control
**Bits UI:** `Slider` primitive available
**Location:** `src/lib/components/atoms/slider/slider.svelte`

### Tooltip

**Use Case:** Word definitions, help text
**Bits UI:** `Tooltip` primitive available
**Location:** `src/lib/components/atoms/tooltip/tooltip.svelte`

### Command

**Use Case:** Quick navigation, command palette
**Bits UI:** `Command` primitive available
**Location:** `src/lib/components/organisms/command/command.svelte`

### Calendar

**Use Case:** Date selection for reading goals
**Bits UI:** `Calendar` primitive available
**Location:** `src/lib/components/organisms/calendar/calendar.svelte`

---

## Testing Checklist

### Per Component

- [ ] Visual regression: Match existing styling
- [ ] Keyboard navigation: Tab order, arrow keys, enter/space
- [ ] Screen reader: Announces correctly, labels associated
- [ ] Mobile touch: Works on touch devices
- [ ] Form integration: Validation, error states

### Integration

- [ ] All imports updated
- [ ] No console errors
- [ ] Build succeeds
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Existing tests pass

### User Flows

- [ ] Upload book flow works
- [ ] Search/filter books works
- [ ] Reader navigation works
- [ ] Settings/preferences works

---

## Migration Order

1. **Phase 1** (This PR): Base wrappers + file-input POC
2. **Phase 2**: Remaining atoms (search-input, drop-zone)
3. **Phase 3**: Molecules (form-field, filter-tabs, search-bar)
4. **Phase 4**: Organisms (upload-modal, library-toolbar)
5. **Phase 5**: Optional new components (PIN Input, Slider, etc.)

---

## Breaking Changes Log

### API Changes

- `file-input`: Removed `click()` method, use trigger pattern instead
- `input`: Added `error` prop for validation states
- `dialog`: Changed from boolean `open` to bindable store pattern

### Import Changes

- Old: `import Button from '$lib/components/atoms/button/button.svelte'`
- New: `import Button from '$lib/components/ui/button/button.svelte'`

---

## Notes

- **Tailwind CSS:** Keep existing utility classes and design tokens
- **Colors:** Maintain red-500 accent, neutral backgrounds
- **Accessibility:** All components must meet WCAG 2.1 AA
- **Bundle Size:** Monitor for significant increases
- **Performance:** Bits UI tree-shaking should keep bundle minimal

---

Last Updated: 2026-02-01
Status: Phase 1 & 2 COMPLETE, Phase 3 & 4 In Progress

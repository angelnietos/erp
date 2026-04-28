# UI Kit - Storybook Stories Documentation

## Overview

This document describes all the Storybook stories available for the UI Kit components. These stories demonstrate the full range of customization options and use cases for each component.

## Components and Stories

### Button (`ui-button`)

**Location:** `src/lib/button/button.component.stories.ts`

**Stories:**
- **Playground** - Interactive button with all controls (color, shape, size, icon, loading, disabled, etc.)
- **Colors** - All color variants (primary, secondary, danger, success, warning, info, app, default)
- **Shapes** - All shape variants (auto, solid, glass, outline, flat, ghost, neumorphic, gradient, soft, link)
- **Sizes** - Size variants (sm, md, lg)
- **WithIcons** - Buttons with different icons and icon positions
- **IconOnly** - Icon-only buttons with accessibility labels
- **States** - Different states (normal, loading, disabled)
- **Widths** - Full-width and block variants
- **Elevation** - Buttons with shadow effects
- **Pulse** - Buttons with pulse animation
- **Links** - Buttons behaving as links
- **Accessibility** - ARIA labels and accessibility features
- **Combinations** - Real-world button combinations

**Key Features:**
- 10 shape variants
- 8 color options
- 3 sizes
- Icon support with positioning
- Loading states
- Full accessibility support
- Multiple visual effects (elevation, pulse)

---

### Input (`ui-input`)

**Location:** `src/lib/input/input.component.stories.ts`

**Stories:**
- **Playground** - Interactive input with all controls
- **Colors** - All color variants
- **Shapes** - All shape variants (auto, solid, glass, outline, flat, neumorphic, underline, minimal, rounded)
- **Sizes** - Size variants (sm, md)
- **WithIcons** - Inputs with icons
- **Types** - Different input types (text, email, password, number, tel, url, date, search)
- **States** - All states (normal, error, success, warning, disabled)
- **Hints** - Inputs with help text
- **Combinations** - Real-world form combinations

**Key Features:**
- 9 shape variants
- 6 color options
- Full validation states
- Icon support
- Hint text support
- ControlValueAccessor for forms

---

### Textarea (`ui-textarea`)

**Location:** `src/lib/textarea/textarea.component.stories.ts`

**Stories:**
- **Playground** - Interactive textarea
- **Variants** - All 14 variants (default, filled, outlined, ghost, dark, light, error, success, warning, info, rounded, minimal, soft, glass)
- **Sizes** - Different row counts
- **States** - All states (normal, error, success, warning, disabled)
- **Hints** - Textareas with help text
- **Combinations** - Real-world examples

**Key Features:**
- 14 visual variants
- Resizable
- Validation states
- Hint text support

---

### Select (`ui-select`)

**Location:** `src/lib/select/select.component.stories.ts`

**Stories:**
- **Playground** - Interactive select
- **Variants** - All 18 variants (default, filled, outlined, ghost, dark, light, error, success, warning, info, theme, primary, secondary, transparent, minimal, rounded, glass, soft)
- **Sizes** - Size variants (sm, md)
- **States** - All states (normal, error, success, warning, disabled)
- **Combinations** - Real-world examples

**Key Features:**
- 18 visual variants
- Customizable options
- Error states
- Size variants
- ControlValueAccessor support

---

### Modal (`ui-modal`)

**Location:** `src/lib/modal/modal.component.stories.ts`

**Stories:**
- **Playground** - Interactive modal with all controls
- **Colors** - All color variants
- **Shapes** - All shape variants (auto, solid, glass, outline, flat, neumorphic, minimal, fullscreen)
- **Sizes** - Size variants (sm, md, lg, xl, fullscreen)
- **FooterVariants** - Different footer configurations
- **Options** - Various options (backdrop, escape, centered, scrollable, hide header)
- **ComplexForm** - Modal with form content

**Key Features:**
- 8 shape variants
- 6 sizes
- 6 color options
- Multiple configuration options
- Customizable footer
- Fullscreen support

---

### Table (`ui-table`)

**Location:** `src/lib/table/table.component.stories.ts`

**Stories:**
- **Playground** - Interactive table
- **Variants** - Style variants (default, striped, glass)
- **LargeDataset** - Virtual scroll with 100 rows
- **Empty** - Empty state
- **CustomCells** - Custom cell rendering
- **FullExample** - Complete table with actions

**Key Features:**
- 3 style variants
- Virtual scroll support
- Custom cell templates
- Empty state handling
- Hover effects

---

### Feature Header (`ui-feature-header`)

**Location:** `src/lib/layout/feature-header/feature-header.component.stories.ts`

**Stories:**
- **PageHero** - Hero-style header with breadcrumbs
- **PageHeroNoBreadcrumb** - Hero without breadcrumbs
- **PageHeroNoAction** - Hero without action button
- **Card** - Card-style header
- **CardNoAction** - Card without action
- **CardUsers** - User stats card
- **CardAlerts** - Alert card
- **CardInventory** - Inventory card
- **CardWithCustomActions** - Custom action buttons

**Key Features:**
- 2 layouts (pageHero, card)
- Breadcrumb support
- Action buttons
- Icon with gradient background
- Responsive design

---

### Feature Card (`ui-feature-card`)

**Location:** `src/lib/layout/feature-card/feature-card.component.stories.ts`

**Stories:**
- **Default** - Basic card
- **Favorite** - Card with favorite star
- **WithoutFooter** - Card without footer
- **AllActions** - Card with all action buttons
- **NoStatus** - Card without status
- **WarningStatus** - Card with warning status
- **DangerStatus** - Card with danger status
- **OfflineStatus** - Card with offline status
- **CardGrid** - Grid of cards
- **BabooniVariant** - Babooni tenant styling

**Key Features:**
- Avatar with status indicator
- Badge support
- Favorite indicator
- Footer items
- Action buttons (edit, delete, duplicate)
- Clickable cards
- Status indicators

---

### Feature Grid (`ui-feature-grid`)

**Location:** `src/lib/layout/feature-grid/feature-grid.component.stories.ts`

**Stories:**
- **Default** - 3-column grid
- **TwoColumns** - 2-column grid
- **FourColumns** - 4-column grid
- **ResponsiveGrid** - Auto-fill responsive grid
- **WithCustomContent** - Mixed content types

**Key Features:**
- Responsive grid layout
- Staggered animation
- Custom column definitions
- Mixed content support

---

### Feature Filter Bar (`ui-feature-filter-bar`)

**Location:** `src/lib/feature-filter-bar/feature-filter-bar.component.stories.ts`

**Stories:**
- **Default** - With 3 active filters
- **NoFilters** - No active filters
- **ManyFilters** - 8 active filters
- **WithForm** - Integrated with filter form

**Key Features:**
- Filter count display
- Clear filters action
- Integration with forms

---

### Search Toolbar (`ui-search-toolbar`)

**Location:** `src/lib/search-toolbar/search-toolbar.component.stories.ts`

**Stories:**
- **Default** - Basic search
- **WithValue** - Search with value
- **WithAdvancedFilters** - Search with advanced filters
- **WithExport** - Search with export button
- **FullFeatured** - All features combined

**Key Features:**
- Search input
- Advanced filter toggle
- Export button
- Value binding

---

### Detail Placeholder (`ui-detail-placeholder`)

**Location:** `src/lib/detail-placeholder/detail-placeholder.component.stories.ts`

**Stories:**
- **Card** - Card loading placeholder
- **CardWithAvatar** - Card with avatar
- **CardWithImage** - Card with image
- **List** - List loading
- **ListLong** - Long list loading
- **Table** - Table loading
- **TableWide** - Wide table loading
- **LoadingStates** - All loading states

**Key Features:**
- 3 types (card, list, table)
- Avatar support
- Image support
- Customizable lines

---

### Card (`ui-card`)

**Location:** `src/lib/card/card.component.stories.ts`

**Stories:**
- **Default** - Basic card
- **Clickable** - Interactive card
- **Selected** - Selected state
- **WithActions** - Card with action buttons
- **CardGrid** - Grid of cards
- **MediaCard** - Card with media

**Key Features:**
- Clickable states
- Selected state
- Hover effects
- Flexible content

---

### Stat Card (`ui-stat-card`)

**Location:** `src/lib/card/stat-card.component.stories.ts`

**Stories:**
- **Default** - Basic stat card
- **PositiveTrend** - Positive trend
- **NegativeTrend** - Negative trend
- **NoTrend** - No trend
- **LargeValue** - Large numbers
- **SmallValue** - Small numbers
- **LoadingState** - Loading state
- **StatsGrid** - Grid of stat cards
- **MixedTrends** - Mixed trend directions

**Key Features:**
- Trend indicators
- Icon support
- Loading states
- Flexible formatting

---

### Nav Menu (`ui-nav-menu`)

**Location:** `src/lib/nav-menu/nav-menu.component.stories.ts`

**Stories:**
- **Default** - Basic navigation
- **DarkVariant** - Dark theme
- **LightVariant** - Light theme
- **PrimaryVariant** - Primary theme
- **GhostVariant** - Ghost style
- **BorderedVariant** - Bordered style
- **CompactVariant** - Compact style
- **WithChildren** - Nested items
- **WithBadges** - Items with badges
- **SidebarLayout** - Sidebar integration

**Key Features:**
- 7 variants
- Nested items
- Badge support
- Active state indicators
- Router integration

---

### Badge (`ui-badge`)

**Location:** `src/lib/badge/badge.component.stories.ts`

**Stories:**
- **Default** - Basic badge
- **Colors** - All colors
- **Variants** - All variants (solid, soft, outline)
- **Sizes** - All sizes (sm, md, lg)
- **WithIcons** - Badges with icons
- **UsageExamples** - Real-world usage
- **BadgesInCards** - Badges in card context

**Key Features:**
- 8 colors
- 3 variants
- 3 sizes
- Icon support

---

### Alert (`ui-alert`)

**Location:** `src/lib/alert/alert.component.stories.ts`

**Stories:**
- **Default** - Basic alert
- **Colors** - All colors with icons
- **Variants** - All variants
- **Closable** - Dismissible alert
- **WithTitle** - Alert with title
- **UsageExamples** - Real-world examples
- **MultipleAlerts** - Multiple alerts

**Key Features:**
- 6 types
- 3 variants
- Closable option
- Icon support
- Title support

---

### Loader (`ui-loader`)

**Location:** `src/lib/loader/loader.component.stories.ts`

**Stories:**
- **Default** - Basic loader
- **Sizes** - Different sizes
- **Colors** - Different colors
- **Variants** - Different variants

**Key Features:**
- Multiple sizes
- Color options
- Animation variants

---

### Tabs (`ui-tabs`)

**Location:** `src/lib/tabs/tabs.component.stories.ts`

**Stories:**
- **Default** - Basic tabs
- **Variants** - Different variants
- **Sizes** - Different sizes
- **Disabled** - Disabled tabs
- **WithBadges** - Tabs with badges

**Key Features:**
- Multiple variants
- Size options
- Disabled states
- Badge support

---

## Design System Principles

### Visual Consistency
- All components share a unified design language
- Consistent spacing, typography, and color usage
- Theme-aware components adapt to light/dark modes

### Customization
- Extensive variant options for each component
- Color, size, and shape customization
- Flexible API with sensible defaults

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Focus states
- Screen reader compatibility

### Responsiveness
- Mobile-first approach
- Adaptive layouts
- Touch-friendly targets

### Performance
- Optimized rendering
- Virtual scroll for large datasets
- Efficient animations

## Usage Guidelines

### When to Use Each Component

- **Button**: Actions, form submissions, navigation triggers
- **Input**: Single-line text entry, forms, search
- **Textarea**: Multi-line text entry, descriptions, comments
- **Select**: Single choice from multiple options
- **Modal**: Focused tasks, confirmations, forms
- **Table**: Tabular data, lists with multiple columns
- **Feature Card**: Dashboard items, project cards, user profiles
- **Feature Header**: Section headers, page titles
- **Feature Grid**: Responsive card layouts
- **Nav Menu**: Primary navigation, sidebars
- **Badge**: Status indicators, counts, categories
- **Alert**: Important messages, warnings, confirmations
- **Loader**: Loading states, progress indication

### Best Practices

1. **Consistency**: Use the same variant for similar elements
2. **Hierarchy**: Use size and color to establish visual hierarchy
3. **Feedback**: Provide loading states and success/error indicators
4. **Accessibility**: Always include ARIA labels for icon-only buttons
5. **Responsiveness**: Test on multiple screen sizes
6. **Performance**: Use virtual scroll for large datasets

## Customization Examples

### Creating a Custom Theme

```typescript
// Override CSS variables
:root {
  --brand: #your-color;
  --brand-secondary: #your-secondary-color;
  --radius-md: 12px;
}
```

### Combining Components

```html
<ui-feature-header
  layout="pageHero"
  title="Dashboard"
  subtitle="Overview"
  actionLabel="New Report"
></ui-feature-header>

<ui-feature-grid [columns]="'repeat(3, 1fr)'">
  <ui-feature-card
    name="Analytics"
    subtitle="Real-time data"
    [footerItems]="[{icon: 'BarChart', label: 'View'}]"
  ></ui-feature-card>
</ui-feature-grid>
```

## Testing

All stories include:
- Visual regression tests
- Accessibility audits
- Interaction tests
- Responsive behavior tests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- More animation variants
- Additional color themes
- Enhanced form validation
- Drag-and-drop support
- Enhanced accessibility features
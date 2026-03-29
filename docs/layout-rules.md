# Layout Rules

This document defines the strict layout system for the project.
Use it together with:

- `docs/design-rules.md`
- `docs/workflow.md`

If a screen is being redesigned or refactored, these rules are the default layout standard.

## Core Layout Rules

### 1. Use a strict desktop grid

- Build the main layout on a 12-column grid.
- Keep consistent outer margins.
- Keep consistent gutters.
- All text blocks must snap to the grid.
- Avoid random placement.

### 2. Use asymmetry intentionally

- The composition should feel dynamic, not centered by default.
- Large headline blocks may sit left or center-left.
- Supporting text should counterbalance the large headline.
- Empty space is part of the composition and must be preserved.

### 3. Text hierarchy must be extreme and clear

Use 4 levels only.

Level 1 - Main statement / main headline

- very large
- dominant
- short or medium length
- visually anchors the screen

Level 2 - Secondary headline / section framing

- medium-large
- introduces the idea of the screen
- often aligned near top-left or center-left

Level 3 - Supporting text blocks

- small
- readable
- short paragraphs or compact notes
- used as side commentary around the main statement

Level 4 - Navigation / utility labels

- small
- quiet
- consistent placement
- never compete with the headline

### 4. Alignment rules

- Default alignment is left.
- Do not center text unless a specific screen composition requires it.
- Side notes and microcopy should align to consistent column edges.
- Vertical or diagonal visual tension should come from placement, not from random transforms.

### 5. Spacing rules

- Use a consistent spacing scale.
- All gaps, margins, paddings, and distances must be system-based.
- No arbitrary micro-adjustments.
- Preserve large negative space between text groups.

### 6. Text block behavior

- Main headings should remain compact and visually bold.
- Supporting paragraphs should stay narrow in measure.
- Do not allow long full-width text lines.
- Keep paragraph width controlled for readability.

### 7. Navigation placement

- Navigation should feel integrated into composition, not like a standard website menu bar.
- Place navigation in stable corners or screen edges.
- Bottom-right and bottom-left placements are preferred for secondary navigation.
- Small utility labels may live near edges.
- The navigation must feel quiet but intentional.

## Screen Composition Rules

### Screen type A - Identity / manifesto screen

- large headline on left or upper-left
- supporting notes placed in distant smaller blocks
- one strong central area of empty space
- bottom navigation remains understated

### Screen type B - Section-intro screen

- smaller structural text near top-left
- main phrase placed more centrally with strong breathing space around it
- keep the screen sparse

### Screen type C - Action / conclusion screen

- one giant keyword in the center or center-left
- supporting word list or section labels in top-left
- navigation in bottom-right
- preserve lots of empty dark space

### Screen type D - Informational section

- one larger heading
- several small supporting text blocks placed around the page
- maintain an editorial poster-like structure
- no standard "card UI"

## Typographic Rules

### 1. Font

- Use PT Root UI consistently.
- Avoid mixing many weights.
- Build contrast primarily through size and placement.

### 2. Heading style

- Large headings should be clean and blunt.
- Tight but not cramped.
- No decorative text effects.
- No unnecessary letter-spacing on paragraph text.

### 3. Body text

- Keep body text small but readable.
- Use comfortable line-height.
- Avoid very long line lengths.
- Preserve a sharp, editorial tone.

### 4. Lists / supporting notes

- Use compact multiline blocks.
- Allow them to feel like marginal commentary.
- Keep them aligned to the grid.

## Responsive Rules

### 1. Preserve the compositional idea across breakpoints

- Do not turn everything into generic stacked blocks unless necessary.
- Keep hierarchy strong on tablet and mobile.

### 2. On smaller screens

- Reduce scale but preserve contrast.
- Keep one dominant phrase per screen.
- Move supporting notes below or beside the main text in a controlled way.
- Keep navigation minimal and calm.

### 3. Avoid layout collapse

- No overlapping text.
- No random wrapping that destroys rhythm.
- Preserve spacing logic at all sizes.

## Implementation Rules

- Use CSS Grid for overall structure.
- Use flex only inside small local groups if needed.
- Avoid excessive absolute positioning.
- Only use absolute positioning for deliberate editorial placements.
- Keep class names semantic and clean.
- Build reusable layout primitives for:
- `section shell`
- `headline block`
- `side note block`
- `bottom nav block`
- `utility label`

## Do Not

- do not use generic hero/section/card layouts
- do not center everything
- do not overuse absolute positioning
- do not make it look like a startup website
- do not flatten the composition into ordinary responsive blocks
- do not let body text stretch too wide
- do not let navigation overpower the editorial rhythm

## Refactor Task Template

When a page layout is being refactored, use this as the task framing:

- Inspect the current page and refactor the layout to follow the rules above.
- Preserve the artistic direction, but make the structure cleaner, stricter, and more systematic.

Expected output:

1. the layout strategy
2. updated HTML structure
3. updated CSS structure
4. explanation of how the grid and typography rules were implemented

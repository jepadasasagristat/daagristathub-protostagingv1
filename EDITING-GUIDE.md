# DA AgriStat Hub — Editing Guide

This guide explains how to edit the site, with a focus on **adding dropdown menu items** and **embedding new dashboard links**.

> **Hub pages to edit:** `psa.html` (PSA datasets) and `da-ops.html` (DA operational data).  
> Most dropdown and embed changes happen in these two files only. You do **not** need to edit JavaScript for routine content updates.

---

## Table of Contents

1. [How the system works](#1-how-the-system-works)
2. [File map — what to edit](#2-file-map--what-to-edit)
3. [Naming rules for slugs](#3-naming-rules-for-slugs)
4. [Add a new dashboard link (most common)](#4-add-a-new-dashboard-link-most-common)
5. [Add a new category inside a dropdown](#5-add-a-new-category-inside-a-dropdown)
6. [Add a new top-level dropdown tab](#6-add-a-new-top-level-dropdown-tab)
7. [Get embed URLs from Looker Studio & Power BI](#7-get-embed-urls-from-looker-studio--power-bi)
8. [Update the mobile menu](#8-update-the-mobile-menu)
9. [Other common edits](#9-other-common-edits)
10. [Checklist before publishing](#10-checklist-before-publishing)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. How the system works

When a user clicks a menu item, the viewer resolves in one of three states:

```
Dropdown link (data-hash)  →  URL hash  →  EMBED_REGISTRY  →  live iframe OR integration pending OR empty placeholder
```

| Step | What happens |
|------|--------------|
| 1 | User clicks **"Rice Production"** in the dropdown |
| 2 | JavaScript reads `data-hash="psa-rice-production"` |
| 3 | Browser URL becomes `psa.html#psa-rice-production` |
| 4 | `embed.js` looks up `psa-rice-production` in `EMBED_REGISTRY` |
| 5a | If entry has a `url` → live dashboard loads in an `<iframe>` |
| 5b | If entry has `title` but **no `url`** → integration-in-progress panel appears |
| 5c | If no registry entry → default "Select a Dashboard" placeholder |

**Important:** The `data-hash` value on the menu link **must exactly match** the key in `EMBED_REGISTRY`. If they differ, the default placeholder screen stays visible.

---

## 2. File map — what to edit

| Task | File(s) |
|------|---------|
| Add/edit dropdown items | `psa.html` or `da-ops.html` |
| Add/edit embed URLs | `EMBED_REGISTRY` block at bottom of `psa.html` or `da-ops.html` |
| Change colors / fonts | `assets/css/main.css` (`:root` variables) |
| Change hub nav colors | `assets/css/hub.css` |
| Change landing page text/cards | `index.html` |
| Change hero stats | `index.html` + `assets/js/counter.js` (only if adding new formats) |

**You rarely need to touch:**
- `assets/js/dropdown.js` — auto-wires all `.mega-dropdown__subitem` links
- `assets/js/embed.js` — auto-reads `window.EMBED_REGISTRY`

---

## 3. Naming rules for slugs

A **slug** is the unique ID shared between the dropdown and the embed registry.

### Format

```
{hub-prefix}-{short-description}
```

| Hub | Prefix | Example |
|-----|--------|---------|
| PSA | `psa-` | `psa-rice-production` |
| DA  | `da-`  | `da-fertilizer` |

### Rules

- Use **lowercase** letters only
- Use **hyphens** instead of spaces (`psa-farmgate-prices`, not `psa farmgate prices`)
- Keep it **short but descriptive**
- **Never reuse** the same slug twice on the same page
- PSA and DA hubs can share similar names because they are separate pages (e.g. both can have `*-rice-production` on different files)

---

## 4. Add a new dashboard link (most common)

Use this when adding a dashboard under an **existing category** (e.g. a new crop under "Production Statistics").

### Example: Add "Sugarcane Production" to PSA → Dashboards → Production Statistics

Open `psa.html` and make changes in **4 places**.

---

### Step A — Mobile accordion (inside the mega-dropdown)

Find the category block inside `.mega-dropdown__inner`:

```html
<div class="mega-dropdown__subitems" data-category="production">
  <!-- existing items... -->
  <a href="#" class="mega-dropdown__subitem" data-hash="psa-sugarcane-production">
    Sugarcane Production
    <span class="commodity">Raw Sugar · Molasses</span>
  </a>
</div>
```

---

### Step B — Desktop sub-items panel

Find the matching panel inside `.mega-dropdown__desktop-subitems`:

```html
<div class="mega-dropdown__desktop-subitems-panel" data-category="production">
  <h4>Production Statistics</h4>
  <!-- existing items... -->
  <a href="#" class="mega-dropdown__subitem" data-hash="psa-sugarcane-production">
    Sugarcane Production
    <span class="commodity">Raw Sugar · Molasses</span>
  </a>
</div>
```

> The `data-hash` must be **identical** in both mobile and desktop blocks.

---

### Step C — Mobile hub drawer (screens under 768px)

Find `.nav-hub-mobile` and add the link inside the correct section:

```html
<div class="nav-hub-mobile__section">
  <button class="nav-hub-mobile__section-btn" aria-expanded="false">Dashboards</button>
  <div class="nav-hub-mobile__content" style="display:none">
    <!-- existing items... -->
    <a href="#" class="mega-dropdown__subitem" data-hash="psa-sugarcane-production">Sugarcane Production</a>
  </div>
</div>
```

---

### Step D — Embed registry

Scroll to the bottom of `psa.html` and add an entry inside `window.EMBED_REGISTRY`:

```html
<script>
  window.EMBED_REGISTRY = {
    // ...existing entries...

    'psa-sugarcane-production': {
      title: 'PSA Sugarcane Production Dashboard',
      type: 'dashboard',
      url: 'https://lookerstudio.google.com/embed/reporting/YOUR-REPORT-ID/page/YOUR-PAGE-ID'
    }
  };
</script>
```

| Field | Purpose |
|-------|---------|
| `title` | Shown in the viewer (iframe title or integration pending heading) |
| `type` | Optional. `'dashboard'`, `'map'`, or `'table'` — controls badge and icon on pending screen (defaults to `dashboard`) |
| `url` | The **embed** URL. Omit until the dashboard is ready — users will see the integration-in-progress panel instead |

### Integration pending vs live embed

**Not ready yet** — register the item without a `url`:

```javascript
'psa-corn-production': {
  title: 'PSA Corn Production Dashboard',
  type: 'dashboard'
}
```

**Ready to go live** — add the embed `url`:

```javascript
'psa-corn-production': {
  title: 'PSA Corn Production Dashboard',
  type: 'dashboard',
  url: 'https://lookerstudio.google.com/embed/reporting/YOUR-ID/page/YOUR-PAGE'
}
```

No HTML or JavaScript changes are needed when promoting an item from pending to live — only add the `url` field.

---

### Step E — Test

1. Open `psa.html` in a browser
2. Click **Dashboards → Production Statistics → Sugarcane Production**
3. Confirm the URL shows `#psa-sugarcane-production`
4. Confirm the dashboard loads in the viewer
5. Resize to mobile width and test the hamburger **Menu** drawer

---

## 5. Add a new category inside a dropdown

Use this when adding a whole new group (e.g. "Fisheries Statistics") inside an existing top tab like **Dashboards**.

You need a unique `data-category` ID (e.g. `fisheries`).

### Step A — Mobile accordion category

Inside the target mega-dropdown's `.mega-dropdown__categories`:

```html
<div class="mega-dropdown__category">
  <button class="mega-dropdown__category-btn" data-category="fisheries" aria-expanded="false">
    Fisheries Statistics
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </button>
  <div class="mega-dropdown__subitems" data-category="fisheries">
    <a href="#" class="mega-dropdown__subitem" data-hash="psa-fish-catch">Fish Catch Volume</a>
    <a href="#" class="mega-dropdown__subitem" data-hash="psa-aquaculture">Aquaculture Production</a>
  </div>
</div>
```

---

### Step B — Desktop category button

Inside `.mega-dropdown__desktop-categories`:

```html
<button class="mega-dropdown__desktop-category" data-category="fisheries">Fisheries Statistics</button>
```

> Only the **first** category in a dropdown should have `is-active` on page load. Remove `is-active` from others if you add a new first item.

---

### Step C — Desktop sub-items panel

Inside `.mega-dropdown__desktop-subitems`:

```html
<div class="mega-dropdown__desktop-subitems-panel" data-category="fisheries">
  <h4>Fisheries Statistics</h4>
  <a href="#" class="mega-dropdown__subitem" data-hash="psa-fish-catch">Fish Catch Volume</a>
  <a href="#" class="mega-dropdown__subitem" data-hash="psa-aquaculture">Aquaculture Production</a>
</div>
```

---

### Step D — Embed registry entries

Add one entry per `data-hash`:

```javascript
'psa-fish-catch': {
  title: 'PSA Fish Catch Volume Dashboard',
  url: 'https://...'
},
'psa-aquaculture': {
  title: 'PSA Aquaculture Production Dashboard',
  url: 'https://...'
}
```

---

### Step E — Mobile hub drawer

Add the new links to the matching `.nav-hub-mobile__section` (or create a note in the section if it fits an existing group).

---

### `data-category` matching rule

These three values **must match** for the same category:

| Element | Attribute |
|---------|-----------|
| Category button (mobile) | `data-category="fisheries"` |
| Sub-items wrapper (mobile) | `data-category="fisheries"` |
| Desktop category button | `data-category="fisheries"` |
| Desktop sub-items panel | `data-category="fisheries"` |

If they don't match, hovering or clicking the category won't show the right items.

---

## 6. Add a new top-level dropdown tab

Use this when adding a fourth main button next to **Dashboards**, **GeoMaps & Baseline Data**, and **Raw Data Tables**.

Copy an entire existing `.nav-hub-primary__item` block and rename it.

### Template

```html
<div class="nav-hub-primary__item">
  <button class="nav-hub-primary__btn"
          aria-expanded="false"
          aria-haspopup="true"
          aria-controls="dropdown-reports">
    Reports
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </button>

  <div class="mega-dropdown" id="dropdown-reports" role="menu">
    <!-- Mobile accordion -->
    <div class="mega-dropdown__inner">
      <div class="mega-dropdown__categories">
        <!-- categories here (see Section 5) -->
      </div>
    </div>

    <!-- Desktop layout -->
    <div class="mega-dropdown__desktop">
      <div class="mega-dropdown__desktop-categories">
        <!-- desktop category buttons -->
      </div>
      <div class="mega-dropdown__desktop-subitems">
        <!-- desktop sub-item panels -->
      </div>
    </div>
  </div>
</div>
```

Also add a matching section in `.nav-hub-mobile`:

```html
<div class="nav-hub-mobile__section">
  <button class="nav-hub-mobile__section-btn" aria-expanded="false">Reports</button>
  <div class="nav-hub-mobile__content" style="display:none">
    <a href="#" class="mega-dropdown__subitem" data-hash="psa-annual-report">Annual Report</a>
  </div>
</div>
```

Then register all `data-hash` values in `EMBED_REGISTRY`.

---

## 7. Get embed URLs from Looker Studio & Power BI

### Looker Studio

1. Open your report in [Looker Studio](https://lookerstudio.google.com)
2. Click **Share** (top right)
3. Click **Embed report**
4. Enable embedding if prompted
5. Copy the **embed URL** — it looks like:
   ```
   https://lookerstudio.google.com/embed/reporting/REPORT-ID/page/PAGE-ID
   ```
6. Paste that full URL into `EMBED_REGISTRY`

> Do **not** use the regular viewing URL (`/reporting/...` without `/embed/`).

---

### Power BI

1. Open your report in Power BI Service
2. Click **File → Embed report → Website or portal**
3. Copy the **iframe embed code**
4. Extract the `src` URL — it looks like:
   ```
   https://app.powerbi.com/view?r=ENCODED-STRING
   ```
   or
   ```
   https://app.powerbi.com/reportEmbed?reportId=...&groupId=...
   ```
5. Paste that URL into `EMBED_REGISTRY`

> The report must be published and embedding must be enabled in Power BI workspace settings.

---

### Direct links (optional)

You can share a direct link to a specific dashboard:

```
psa.html#psa-rice-production
da-ops.html#da-fertilizer
```

Bookmark or share these URLs to open a dashboard immediately on page load.

---

## 8. Update the mobile menu

The mobile drawer (`.nav-hub-mobile`) is **separate HTML** from the desktop mega-dropdown. It does not auto-sync.

Every time you add a menu item, also add it to the correct `.nav-hub-mobile__section`.

| Top tab | Mobile section button label |
|---------|----------------------------|
| Dashboards | `Dashboards` |
| GeoMaps & Baseline Data | `GeoMaps & Baseline Data` |
| Raw Data Tables | `Raw Data Tables` |

If you skip this step, the item will work on desktop but **won't appear** in the mobile hamburger menu.

---

## 9. Other common edits

### Change an existing embed URL

Only edit the `url` field in `EMBED_REGISTRY`. No dropdown changes needed.

```javascript
'psa-rice-production': {
  title: 'PSA Rice Production Dashboard',
  type: 'dashboard',
  url: 'https://lookerstudio.google.com/embed/reporting/NEW-ID/page/NEW-PAGE'
}
```

### Mark an item as integration pending

Remove the `url` field (keep `title` and `type`). Users will see the branded integration-in-progress card instead of a broken iframe.

```javascript
'psa-corn-production': {
  title: 'PSA Corn Production Dashboard',
  type: 'dashboard'
}
```

---

### Rename a menu item (keep same dashboard)

Change the visible text in the HTML only. Keep `data-hash` and `EMBED_REGISTRY` key unchanged.

---

### Rename a slug (change the ID)

If you change `data-hash="psa-rice-production"` to `data-hash="psa-rice-output"`:

1. Update **every** HTML occurrence of the old slug (mobile accordion, desktop panel, mobile drawer)
2. Rename the matching key in `EMBED_REGISTRY`
3. Update any saved bookmarks/links using the old `#hash`

---

### Add optional commodity subtitle

```html
<a href="#" class="mega-dropdown__subitem" data-hash="psa-rice-production">
  Rice Production
  <span class="commodity">Palay · Milled Rice</span>
</a>
```

The `<span class="commodity">` is optional. It renders in a smaller mono font below the label.

---

### Edit landing page stats

In `index.html`, find `.stat-ticker__value` elements:

```html
<span class="stat-ticker__value"
      data-counter="1.87"
      data-format="currency"
      data-duration="2200">
  ₱0.00 Trillion
</span>
```

| Attribute | Purpose |
|-----------|---------|
| `data-counter` | Target number to count up to |
| `data-format` | `currency`, `million`, `hectares`, or default |
| `data-duration` | Animation time in milliseconds |

---

### Edit colors

Open `assets/css/main.css` and change `:root` variables:

```css
:root {
  --color-primary: #1B4D2E;   /* DA green */
  --color-accent:  #F5A623;   /* Harvest gold */
  --color-psa:     #1A5276;   /* PSA hub accent */
  --color-da:      #1B4D2E;   /* DA hub accent */
}
```

---

## 10. Checklist before publishing

Use this checklist every time you add or change content:

- [ ] `data-hash` slug is unique and uses the correct prefix (`psa-` or `da-`)
- [ ] Same `data-hash` appears in **mobile accordion** and **desktop panel**
- [ ] Matching entry exists in `EMBED_REGISTRY` with `title` and `type`
- [ ] If live: entry includes a working embed `url`. If pending: `url` is omitted
- [ ] Link added to `.nav-hub-mobile` for mobile users
- [ ] `title` in registry is descriptive (used for accessibility)
- [ ] Tested on desktop — dropdown opens, item loads dashboard
- [ ] Tested on mobile — hamburger menu shows the new item
- [ ] Tested direct URL with hash (e.g. `psa.html#your-slug`)
- [ ] No typos in `data-category` IDs across all four category elements

---

## 11. Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Clicking item shows default placeholder | `data-hash` doesn't match `EMBED_REGISTRY` key | Make slugs identical (case-sensitive) |
| Integration pending shown | Entry exists but has no `url` | Expected — add `url` when embed is ready |
| Item missing on phone | Not added to `.nav-hub-mobile` | Add link to mobile drawer section |
| Category shows empty panel | `data-category` IDs don't match | Align IDs on button, subitems, and panel |
| Dashboard blank / error | Wrong URL type | Use **embed** URL, not view/share URL |
| URL hash changes but nothing loads | `EMBED_REGISTRY` script is after `embed.js` | Keep registry `<script>` **before** `embed.js` |
| Skeleton loader never disappears | Embed URL blocked or invalid | Test URL directly in a new browser tab |
| Desktop dropdown doesn't open | HTML structure broken | Ensure `.mega-dropdown` is inside `.nav-hub-primary__item` |

---

## Quick reference — minimum steps to add one dashboard

```
1. Choose a slug:     psa-banana-production
2. Add HTML link:     data-hash="psa-banana-production"  (×3 places: mobile accordion, desktop panel, mobile drawer)
3. Add registry:      'psa-banana-production': { title: '...', type: 'dashboard' }           ← pending
                      'psa-banana-production': { title: '...', type: 'dashboard', url: '...' } ← live
4. Test:              psa.html#psa-banana-production
```

---

## PSA vs DA — which file?

| Content type | Edit this file |
|--------------|----------------|
| PSA production, trade, prices, census data | `psa.html` |
| DA programs, inputs, extension, irrigation, lending | `da-ops.html` |
| Landing page, portal cards, about, contact | `index.html` |

Both hub files follow the **same structure**. When in doubt, search for a similar existing item and copy its pattern.

---

*Department of Agriculture — Agricultural Statistics Office · DA AgriStat Hub*

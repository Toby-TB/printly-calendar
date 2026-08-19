# 🗓️ Calendar Studio · Monthly Print

A month-view calendar web app: weekdays as columns, dates as a grid, with DIY styling,
preset templates, and dedicated support for **printing + punching holes to bind into a booklet**.

> 中文说明：[README.md](./README.md)

## Quick Start

Pure static web pages — no installation or build step required:

1. Open `index.html` directly in a browser, or
2. Serve it locally (optional):
   ```bash
   python3 -m http.server 8080
   # then visit http://localhost:8080
   ```

Events are stored in the browser's `localStorage` and can be migrated via JSON export/import.

## Languages

Use the language selector in the top-right corner. The whole UI, calendar, and print pages
switch instantly between:

- 简体中文 (Simplified Chinese)
- 繁體中文 (Traditional Chinese)
- English

The language preference is saved automatically; on first launch the app tries to follow
the browser language.

## Features

### 📋 Event Management
- Month view: 7 weekday columns × 6 date rows, with Monday/Sunday start switchable
- Today highlighted, weekend shading, adjacent-month dates dimmed
- Click a date to add an event; click a colored chip to edit/delete
- Supports: title, start date, end date (multi-day), time, category color, note
- Category legend: 6 built-in categories, add/delete custom ones, click a legend item to hide that category
- "Month events" list in the sidebar for quick browsing and editing

### 🎨 DIY Design
- 8 preset templates: Cream Journal / Matcha Fresh / Morandi / Vintage Kraft / Sakura Pink / Midnight Blue / Minimal White / Sea Salt Blue
- Customize: accent color, paper background, pattern (dots/grid/lines/diagonal/star dots), font, corner radius, background image
- Element toggles: print punch-hole marks, corner decorations, grid lines, weekend shading
- All settings apply instantly and are saved automatically

### 🖨 Print & Bind
- **Select a date range**: start month + end month, with quick presets "This year" and "Next 12 months"
- One A4 page is generated per month in the range (with a preview for checking)
- **Every page reserves a 26mm top binding area**, with a dashed guide and optional punch-hole marks (for ring/hole binding)
- Optional cover page (custom title, highlighted months in range)
- Notes area and page numbers at the bottom
- Print pages use the current DIY theme (colors/pattern/background image); enable "Background graphics" in the browser print dialog
- Multi-day events are marked continuously across the printed pages

## File Structure

```
├── index.html                 # Page structure
├── styles.css                 # UI + print styles (@page A4)
├── app.js                     # All logic + trilingual translations (zero dependencies)
├── calendar-all-in-one.html   # Single-file build (CSS/JS inlined, double-click to use)
├── calendar-app.zip           # Packaged download
├── README.md                  # 中文说明
└── README_EN.md               # English documentation
```

## Tips

- Check the page count in "Print preview" before printing; in Chrome choose `A4 / Portrait / Margins: None / Background graphics: On`
- Default punch holes: two circles centered 65mm from each side (standard A4 two-hole binding positions), 10.5mm from the top
- The cover page can be disabled in the "Print" panel; the cover title is customizable
- Switching templates resets custom colors/pattern (and removes the background image), so pick a template first and fine-tune afterwards

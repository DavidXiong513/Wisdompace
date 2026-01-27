# AGENTS.md - MyWisdompace Development Guide

## Project Overview
Hybrid static website for "《一生的整理》" (Chinese book on life organization). Multi-page HTML files with SPA-style navigation. Warm humanistic aesthetics (80%) with cyberpunk accents (20%).

## Development Commands
**No build process** - Open `index.html` directly or use VS Code Live Server.
- **HTML Validation**: Use W3C HTML Validator (https://validator.w3.org/)
- **CSS Validation**: Use W3C CSS Validator (https://jigsaw.w3.org/css-validator/)
- **JS Validation**: Browser console (no formal linting)
- **No npm/yarn**: No package.json exists

## Code Style Guidelines

### HTML
- Always include `<!DOCTYPE html>`, `lang="zh-CN"`, `charset="UTF-8"`
- Include viewport meta tag for responsiveness: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Use semantic tags (header, section, nav, footer)
- Add `data-spa` attribute to links using SPA navigation
- Add `data-href` attribute alongside href for SPA links
- Indentation: 4 spaces (no tabs), line endings: LF
- Load scripts in order: router.js → animations.js → storage.js → tools-placeholder.js

### CSS
- **File order**: common.css → warm.css → cyberpunk.css → chapter.css
- **Class naming**: kebab-case (e.g., `nav-container`, `chapter-card`)
- Use CSS variables for colors defined in theme files (via :root)
- Mobile-first responsive: breakpoints at 768px, 1024px
- No vendor prefixes needed (modern browsers only)
- Use `transform`/`opacity` for GPU-accelerated animations
- Section comments: `/* ==================== Section Name ==================== */`

### JavaScript
- **ES6+ only**: const, let, arrow functions, async/await, template literals
- **Module pattern**: `const ModuleName = { ... }` object-based modules
- **DOM selection**: `getElementById` for single elements, `querySelectorAll` for collections
- **Event handling**: Always `addEventListener`, null existing handlers before rebinding (`onclick = null`)
- **No jQuery**: Vanilla JS only
- **Error handling**: Try-catch for localStorage and fetch operations, log errors with `console.error`
- **Comments**: Section header comments `// ==================== Module Name ==================== //`
- **Async/await**: Use Promise-based patterns for animations (fadeOut, fadeIn, showLoading, hideLoading)
- **IntersectionObserver**: Use for scroll-based reading progress tracking (threshold: 0.5)

### Chinese Text
- **Fonts**: `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'` (with system font fallback)
- **Line breaks**: `word-break: keep-all; overflow-wrap: break-word;`
- **Text alignment**: `text-align: justify; text-justify: inter-ideograph;`
- Always UTF-8 encoding
- Use meaningful Chinese comments for module sections

### Error Handling
- localStorage operations: wrap in try-catch, return boolean success
- Fetch operations: check response.ok, throw Error with status
- JSON parsing: wrap in try-catch, log errors
- Graceful degradation: fallback to direct navigation on SPA errors

## Architecture

### File Structure
```
index.html, chapter-[1-4].html  # Page files (root level)
assets/css/                     # common.css, warm.css, cyberpunk.css, chapter.css
assets/js/                      # router.js, animations.js, storage.js, tools-placeholder.js
assets/images/                  # SVG placeholders
```

### SPA Navigation (router.js)
- Intercept links with `data-spa` attribute
- Transitions: fadeOut → loading → loadPage → hideLoading → fadeIn
- Uses `history.pushState()` for back/forward support
- Falls back to direct navigation on error
- Reinitializes scripts after page load
- Cleanup event listeners: `onclick = null` before rebinding

### Storage (storage.js)
```javascript
{
    readingProgress: { 'chapter-1': { sectionId, timestamp } },
    toolStates: { 'tool-id': { data, timestamp } },
    userPreferences: { theme, fontSize, language }
}
```
- Auto-save on `beforeunload` event
- Export/Import data as JSON files
- Storage size tracking methods

### Color Palette
**Warm (Primary):** `--bg-primary: #F5E6D3`, `--bg-secondary: #E8D4B8`, `--accent-warm: #E8C872`, `--text-primary: #3D2B1F`, `--text-secondary: #5D4A3A`
**Cyberpunk (Accents):** `--cyber-blue: #00F0FF`, `--cyber-purple: #BD00FF`, `--cyber-dark: #1A1A2E`

### Tool Placeholders
Status: `developing` (gold), `ready` (green), `maintenance` (gray)
Tool IDs: `role-pie-chart`, `identity-portrait`, `tag-selector`, `role-stripper`, `life-finder`, `choice-maker`, `responsibility-list`, `choice-rights`, `goodbye-list`

### Animation Patterns
- Fade transitions: 300ms timing, using opacity CSS property
- Scroll-based: IntersectionObserver with 0.5 threshold
- Canvas animations: requestAnimationFrame for smooth rendering (digital rain)
- CSS animations: use @keyframes for complex transforms
- GPU acceleration: always use transform/opacity, never top/left/width/height

### Module Initialization
```javascript
const ModuleName = {
    init() {
        // Setup code here
    }
};
document.addEventListener('DOMContentLoaded', () => {
    ModuleName.init();
});
```

## Typography Scale
- H1: 3.5rem (desktop) / 2.8rem (tablet) / 2.2rem (mobile)
- H2: 2rem, H3: 1.8rem
- Body: 1.15rem, line-height: 1.8
- Font weights: headings 300, body default

## Testing
Manual testing required in Chrome, Firefox, Safari, Edge (latest versions)
Test checklist:
- SPA navigation works, back/forward buttons functional
- Mobile menu toggle responsive
- Scroll animations trigger on viewport
- LocalStorage saves/loads correctly
- Responsive breakpoints (768px, 1024px) display correctly
- Chinese text renders with proper line breaking
- No console errors in production

## Browser Support
Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. No IE support.

## Code Review Checklist
- [ ] HTML valid (DOCTYPE, lang, charset, viewport)
- [ ] Semantic tags used (header, section, nav, footer)
- [ ] CSS follows kebab-case naming conventions
- [ ] CSS variables used from theme files
- [ ] JavaScript uses const/let appropriately (no var)
- [ ] Event listeners properly cleaned before rebinding
- [ ] No console.log in production (only console.error)
- [ ] Async operations properly handled with try-catch
- [ ] Responsive design tested on all breakpoints
- [ ] Chinese text renders correctly with proper fonts
- [ ] SPA navigation works, no broken links
- [ ] Animations smooth and performant (transform/opacity)
- [ ] LocalStorage operations handle errors gracefully
- [ ] Module patterns followed (const ModuleName = {})

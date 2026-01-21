# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for Chrome browser extensions. Each extension lives in its own directory with its own package.json and development setup.

## Extensions

### x_following_tag

Chrome extension (Manifest V3) that automatically switches from the "For you" tab to the "Following" tab on X.com (Twitter) home page.

**Commands (run from x_following_tag/):**
```bash
docker compose run --rm test   # Run Jest unit tests
docker compose run --rm build  # Package extension to dist/x-following-tab.zip
```

**Key files:**
- `manifest.json` - Extension manifest (Manifest V3)
- `content.js` - Content script injected into X.com pages

**Debug mode:** Set `DEBUG = true` in content.js:5 to enable console logging with `[X-Following]` prefix.

**Install for development:** Load unpacked extension from x_following_tag/ directory at `chrome://extensions/`

## Architecture Notes

The x_following_tag extension handles X.com's React SPA by:
- Using multiple selector strategies (href, text content, DOM traversal) to find the Following tab
- Dispatching mousedown/mouseup/click events for React compatibility
- Using MutationObserver and retry delays (0-5000ms) for dynamic content
- Intercepting history.pushState/replaceState for SPA navigation detection

## Shared Tools

The `tools/` directory contains utility scripts:
- `create-icons.js` - Generates extension icons using the canvas library
- `create-screenshot.js` - Creates promotional screenshots

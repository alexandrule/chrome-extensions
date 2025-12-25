# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that automatically switches from the "For you" tab to the "Following" tab on X.com (Twitter) home page.

## Architecture

- **manifest.json**: Extension configuration, targets x.com and twitter.com domains
- **content.js**: Content script that runs on page load with multiple strategies to find and click the Following tab

### Key Implementation Details

The extension handles X.com's React-based SPA with:
- Multiple selector strategies (href, text content, DOM traversal from "For you" span)
- Simulated mouse events for React compatibility (mousedown, mouseup, click)
- MutationObserver for dynamic content loading
- Retry mechanism with increasing delays (0-5000ms)
- URL change detection for SPA navigation
- Visibility change handling for tab switching

### Debug Mode

Set `DEBUG = true` in content.js line 5 to enable console logging with `[X-Following]` prefix.

## Installation

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select this directory

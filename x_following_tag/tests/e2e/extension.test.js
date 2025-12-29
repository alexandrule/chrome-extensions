/**
 * E2E tests for X Following Tab Auto-Switch extension
 * Uses Playwright to test the extension in a real browser
 *
 * Note: These tests require logging into X.com manually or using test credentials
 * Run with: npm run test:e2e
 */

const { chromium } = require('playwright');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../..');

async function runTests() {
  console.log('Starting E2E tests for X Following Tab extension...\n');

  let browser;
  let context;

  try {
    // Launch browser with extension loaded
    browser = await chromium.launchPersistentContext(
      path.join(EXTENSION_PATH, 'browser-data'),
      {
        headless: false, // Extensions require headed mode
        args: [
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`,
        ],
        viewport: { width: 1280, height: 720 },
      }
    );

    const page = await browser.newPage();

    // Test 1: Extension loads without errors
    console.log('Test 1: Extension loads without errors');
    page.on('pageerror', error => {
      if (error.message.includes('[X-Following]')) {
        console.error('  ❌ Extension error:', error.message);
      }
    });

    page.on('console', msg => {
      if (msg.text().includes('[X-Following]')) {
        console.log('  Extension log:', msg.text());
      }
    });

    // Navigate to X.com
    console.log('\nNavigating to X.com...');
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Test 2: Check if Following tab exists
    console.log('\nTest 2: Following tab detection');
    const followingTab = await page.$('a[href="/following"]');
    if (followingTab) {
      console.log('  ✓ Following tab found by href');
    } else {
      // Try alternative selector
      const followingSpan = await page.$('span:has-text("Following")');
      if (followingSpan) {
        console.log('  ✓ Following tab found by text content');
      } else {
        console.log('  ⚠ Following tab not found (may need to be logged in)');
      }
    }

    // Test 3: Check current tab state
    console.log('\nTest 3: Tab state detection');
    const activeTab = await page.$('a[role="tab"][aria-selected="true"]');
    if (activeTab) {
      const tabText = await activeTab.textContent();
      console.log(`  Current active tab: "${tabText.trim()}"`);

      if (tabText.includes('Following')) {
        console.log('  ✓ Extension successfully switched to Following tab!');
      } else {
        console.log('  ⚠ Extension may not have switched (or Following was already active)');
      }
    } else {
      console.log('  ⚠ Could not determine active tab');
    }

    // Test 4: SPA navigation handling
    console.log('\nTest 4: SPA navigation handling');
    // Navigate away and back
    await page.click('a[href="/explore"]').catch(() => {
      console.log('  ⚠ Could not navigate to Explore (selector may have changed)');
    });
    await page.waitForTimeout(1000);

    // Click Home to trigger SPA navigation
    const homeLink = await page.$('a[href="/home"]');
    if (homeLink) {
      await homeLink.click();
      await page.waitForTimeout(2000);

      const activeTabAfterNav = await page.$('a[role="tab"][aria-selected="true"]');
      if (activeTabAfterNav) {
        const tabText = await activeTabAfterNav.textContent();
        console.log(`  Tab after navigation: "${tabText.trim()}"`);
        if (tabText.includes('Following')) {
          console.log('  ✓ Extension handles SPA navigation correctly!');
        }
      }
    }

    console.log('\n✓ E2E tests completed');
    console.log('\nNote: Full test verification requires being logged into X.com');

    // Keep browser open for manual inspection
    console.log('\nBrowser will close in 10 seconds (or press Ctrl+C)...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTests();

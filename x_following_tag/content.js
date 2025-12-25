// Auto-switch to "Following" tab on X.com home page
(function() {
  'use strict';

  const DEBUG = false; // Set to true for debugging
  const log = (...args) => DEBUG && console.log('[X-Following]', ...args);

  let switched = false;

  function findFollowingTab() {
    // Debug: log all links on the page
    const allLinks = document.querySelectorAll('a');
    log('Total links on page:', allLinks.length);

    // Find links containing "Following" or "following"
    const followingLinks = [];
    allLinks.forEach(link => {
      const text = link.textContent || '';
      const href = link.getAttribute('href') || '';
      if (text.includes('Following') || href.includes('following')) {
        followingLinks.push({ text: text.trim().slice(0, 30), href, el: link });
      }
    });
    log('Links with "Following":', followingLinks.map(l => ({ text: l.text, href: l.href })));

    // Strategy 1: Look for link with href="/following"
    for (const { el, href } of followingLinks) {
      if (href === '/following') {
        log('Found by href="/following"');
        return el;
      }
    }

    // Strategy 2: Look for link where text is exactly "Following"
    for (const { el, text } of followingLinks) {
      if (text === 'Following') {
        log('Found by exact text "Following"');
        return el;
      }
    }

    // Strategy 3: Look in the tab area near "For you"
    const forYouSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent === 'For you');
    if (forYouSpan) {
      log('Found "For you" span, looking for sibling tabs...');
      const tabContainer = forYouSpan.closest('div[role="tablist"]') ||
                          forYouSpan.closest('nav') ||
                          forYouSpan.parentElement?.parentElement?.parentElement;
      if (tabContainer) {
        const links = tabContainer.querySelectorAll('a');
        log('Links in tab container:', links.length);
        for (const link of links) {
          if (link.textContent?.includes('Following')) {
            log('Found Following in tab container');
            return link;
          }
        }
      }
    }

    // Strategy 4: Find any clickable element with "Following" text near top of page
    const spans = document.querySelectorAll('span');
    for (const span of spans) {
      if (span.textContent === 'Following') {
        const rect = span.getBoundingClientRect();
        // Only consider elements in the top portion of the page (tab area)
        if (rect.top < 200 && rect.top > 0) {
          // Walk up to find the best clickable ancestor
          let el = span;
          let bestClickable = null;

          for (let i = 0; i < 10 && el; i++) {
            const tag = el.tagName;
            const role = el.getAttribute('role');

            // Prefer elements with tab role or anchor tags
            if (role === 'tab' || tag === 'A') {
              bestClickable = el;
              break;
            }

            // Also consider divs with role="presentation" or that look like tabs
            if (role === 'presentation' || (tag === 'DIV' && el.getAttribute('tabindex'))) {
              bestClickable = el;
            }

            // Keep track of clickable-looking containers
            if (tag === 'DIV' && !bestClickable) {
              bestClickable = el;
            }

            el = el.parentElement;
          }

          if (bestClickable) {
            log('Found Following span near top, best clickable:', bestClickable.tagName, 'role:', bestClickable.getAttribute('role'));
            return bestClickable;
          }
        }
      }
    }

    return null;
  }

  function simulateClick(element) {
    // Try multiple click methods for React compatibility
    log('Simulating click on:', element.tagName);

    // Method 1: Dispatch mouse events
    const events = ['mousedown', 'mouseup', 'click'];
    events.forEach(eventType => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      });
      element.dispatchEvent(event);
    });

    // Method 2: Also try native click
    element.click();

    // Method 3: If it's a div, try clicking the closest anchor or going up the tree
    let parent = element.parentElement;
    for (let i = 0; i < 5 && parent; i++) {
      if (parent.tagName === 'A' || parent.getAttribute('role') === 'tab') {
        log('Also clicking parent:', parent.tagName);
        parent.click();
        break;
      }
      parent = parent.parentElement;
    }
  }

  function isFollowingTabActive(element) {
    // Check if Following tab is already selected
    if (element.getAttribute('aria-selected') === 'true') {
      return true;
    }
    // Check for visual indicator (blue underline)
    const hasActiveIndicator = element.querySelector('[style*="background-color: rgb(29, 155, 240)"]') ||
                               element.querySelector('[style*="rgb(29, 155, 240)"]');
    if (hasActiveIndicator) {
      return true;
    }
    // Check parent for aria-selected
    let parent = element.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      if (parent.getAttribute('aria-selected') === 'true') {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  function clickFollowingTab() {
    const followingTab = findFollowingTab();

    if (followingTab) {
      log('Found Following tab:', followingTab);

      // Check if Following tab is already active
      const isActive = isFollowingTabActive(followingTab);
      log('Is Following tab active:', isActive);

      if (!isActive && !switched) {
        switched = true;
        log('Clicking Following tab...');
        simulateClick(followingTab);
        return true;
      } else {
        log('Already on Following tab or already switched');
      }
    } else {
      log('Following tab not found. Current selectors on page:');
      const tabs = document.querySelectorAll('a[role="tab"]');
      tabs.forEach(t => log('  Tab:', t.textContent?.trim(), t.href));
    }
    return false;
  }

  // Only run on home page
  function shouldRun() {
    const path = window.location.pathname;
    const should = path === '/home' || path === '/' || path === '';
    log('shouldRun:', should, 'path:', path);
    return should;
  }

  function init() {
    log('init() called, URL:', window.location.href);

    if (!shouldRun()) {
      switched = false;
      return;
    }

    // Reset switch flag when navigating to home
    switched = false;

    // Try with increasing delays to handle post-login loading
    const delays = [0, 100, 300, 500, 1000, 1500, 2000, 3000, 5000];
    delays.forEach(delay => {
      setTimeout(() => {
        if (!switched) {
          log(`Attempt at ${delay}ms`);
          clickFollowingTab();
        }
      }, delay);
    });

    // Also use observer for dynamic content
    let attempts = 0;
    const maxAttempts = 100;

    const observer = new MutationObserver(() => {
      attempts++;
      if (switched || attempts >= maxAttempts) {
        observer.disconnect();
        return;
      }
      clickFollowingTab();
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Cleanup observer after 15 seconds
    setTimeout(() => observer.disconnect(), 15000);
  }

  // Run on initial load
  log('Extension loaded');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run when page becomes visible (handles tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      log('Page became visible');
      switched = false;
      setTimeout(init, 200);
    }
  });

  // Handle SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      log('URL changed:', lastUrl, '->', url);
      lastUrl = url;
      switched = false;
      setTimeout(init, 100);
    }
  }).observe(document, { subtree: true, childList: true });

  // Handle history state changes (login redirects)
  window.addEventListener('popstate', () => {
    log('popstate event');
    switched = false;
    setTimeout(init, 200);
  });

  // Intercept clicks on Home link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="/home"]');
    if (link) {
      log('Clicked Home link');
      switched = false;
      setTimeout(init, 300);
    }
  }, true);

  // Also intercept pushState/replaceState for SPA navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    log('pushState called');
    switched = false;
    setTimeout(init, 100);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    log('replaceState called');
    switched = false;
    setTimeout(init, 100);
  };
})();

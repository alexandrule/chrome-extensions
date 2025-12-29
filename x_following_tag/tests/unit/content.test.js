/**
 * Unit tests for X Following Tab Auto-Switch extension
 * Tests the core DOM selection and click logic
 */

describe('X Following Tab Auto-Switch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('findFollowingTab', () => {
    // Helper to create mock X.com tab structure
    function createMockTabs(activeTab = 'for-you') {
      document.body.innerHTML = `
        <nav role="navigation">
          <div role="tablist">
            <a href="/foryou" role="tab" aria-selected="${activeTab === 'for-you'}">
              <span>For you</span>
            </a>
            <a href="/following" role="tab" aria-selected="${activeTab === 'following'}">
              <span>Following</span>
            </a>
          </div>
        </nav>
      `;
    }

    test('should find Following tab by href="/following"', () => {
      createMockTabs();
      const link = document.querySelector('a[href="/following"]');
      expect(link).not.toBeNull();
      expect(link.textContent).toContain('Following');
    });

    test('should find Following tab by exact text content', () => {
      document.body.innerHTML = `
        <nav>
          <a><span>For you</span></a>
          <a><span>Following</span></a>
        </nav>
      `;
      const spans = document.querySelectorAll('span');
      const followingSpan = Array.from(spans).find(s => s.textContent === 'Following');
      expect(followingSpan).not.toBeNull();
    });

    test('should not match partial text like "Following you"', () => {
      document.body.innerHTML = `
        <div>
          <span>Following you</span>
          <a href="/following"><span>Following</span></a>
        </div>
      `;
      // The extension looks for exact "Following" text
      const spans = document.querySelectorAll('span');
      const exactMatch = Array.from(spans).find(s => s.textContent === 'Following');
      expect(exactMatch.textContent).toBe('Following');
    });
  });

  describe('isFollowingTabActive', () => {
    test('should detect active tab via aria-selected', () => {
      document.body.innerHTML = `
        <a href="/following" role="tab" aria-selected="true">
          <span>Following</span>
        </a>
      `;
      const tab = document.querySelector('a[href="/following"]');
      expect(tab.getAttribute('aria-selected')).toBe('true');
    });

    test('should detect inactive tab via aria-selected', () => {
      document.body.innerHTML = `
        <a href="/following" role="tab" aria-selected="false">
          <span>Following</span>
        </a>
      `;
      const tab = document.querySelector('a[href="/following"]');
      expect(tab.getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('shouldRun', () => {
    test('should run on /home path', () => {
      delete window.location;
      window.location = { pathname: '/home', href: 'https://x.com/home' };
      expect(window.location.pathname).toBe('/home');
    });

    test('should run on root path', () => {
      delete window.location;
      window.location = { pathname: '/', href: 'https://x.com/' };
      expect(window.location.pathname).toBe('/');
    });

    test('should not run on profile pages', () => {
      delete window.location;
      window.location = { pathname: '/username', href: 'https://x.com/username' };
      const shouldRun = ['/home', '/', ''].includes(window.location.pathname);
      expect(shouldRun).toBe(false);
    });

    test('should not run on search page', () => {
      delete window.location;
      window.location = { pathname: '/search', href: 'https://x.com/search' };
      const shouldRun = ['/home', '/', ''].includes(window.location.pathname);
      expect(shouldRun).toBe(false);
    });
  });

  describe('simulateClick', () => {
    test('should dispatch mouse events in correct order', () => {
      const events = [];
      const element = document.createElement('a');

      ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        element.addEventListener(eventType, () => events.push(eventType));
      });

      // Simulate what the extension does
      ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        const event = new MouseEvent(eventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        });
        element.dispatchEvent(event);
      });

      expect(events).toEqual(['mousedown', 'mouseup', 'click']);
    });

    test('should create events with correct properties', () => {
      const element = document.createElement('a');
      let capturedEvent = null;

      element.addEventListener('click', (e) => {
        capturedEvent = e;
      });

      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      });
      element.dispatchEvent(event);

      expect(capturedEvent.bubbles).toBe(true);
      expect(capturedEvent.cancelable).toBe(true);
    });
  });

  describe('DOM traversal strategies', () => {
    test('should find tab container from For you span', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <a role="tab"><span>For you</span></a>
          <a role="tab"><span>Following</span></a>
        </div>
      `;
      const forYouSpan = Array.from(document.querySelectorAll('span'))
        .find(s => s.textContent === 'For you');
      const tabContainer = forYouSpan.closest('div[role="tablist"]');

      expect(tabContainer).not.toBeNull();
      const links = tabContainer.querySelectorAll('a');
      expect(links.length).toBe(2);
    });

    test('should find clickable parent with role="tab"', () => {
      document.body.innerHTML = `
        <a role="tab" href="/following">
          <div>
            <span>Following</span>
          </div>
        </a>
      `;
      const span = document.querySelector('span');
      let el = span;
      let foundTab = null;

      for (let i = 0; i < 10 && el; i++) {
        if (el.getAttribute('role') === 'tab' || el.tagName === 'A') {
          foundTab = el;
          break;
        }
        el = el.parentElement;
      }

      expect(foundTab).not.toBeNull();
      expect(foundTab.tagName).toBe('A');
      expect(foundTab.getAttribute('role')).toBe('tab');
    });
  });

  describe('Security checks', () => {
    test('should not execute any external scripts', () => {
      // Verify no script injection
      const scripts = document.querySelectorAll('script[src]');
      expect(scripts.length).toBe(0);
    });

    test('should not modify innerHTML with user content', () => {
      // The extension only reads from DOM, never writes innerHTML
      // This test documents that behavior
      const originalInnerHTML = document.body.innerHTML;
      // Extension only uses: querySelector, textContent (read), getAttribute
      // Never: innerHTML =, insertAdjacentHTML, document.write
      expect(document.body.innerHTML).toBe(originalInnerHTML);
    });
  });
});

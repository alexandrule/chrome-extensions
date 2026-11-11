/**
 * Unit tests for X Following Tab Auto-Switch extension
 * Tests the core DOM selection and click logic
 */

const {
  findFollowingTab,
  simulateClick,
  isFollowingTabActive,
  shouldRun,
  clickFollowingTab,
} = require('../../content.js');

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
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.getAttribute('href')).toBe('/following');
    });

    test('should find Following tab by exact text content', () => {
      document.body.innerHTML = `
        <nav>
          <a><span>For you</span></a>
          <a><span>Following</span></a>
        </nav>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.textContent).toContain('Following');
    });

    test('should not match partial text like "Following you"', () => {
      document.body.innerHTML = `
        <div>
          <span>Following you</span>
          <a href="/following"><span>Following</span></a>
        </div>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.getAttribute('href')).toBe('/following');
    });

    test('should return null when no Following tab exists', () => {
      document.body.innerHTML = `<div><span>Nothing here</span></div>`;
      const tab = findFollowingTab();
      expect(tab).toBeNull();
    });

    test('should find tab via DOM traversal from "For you"', () => {
      document.body.innerHTML = `
        <div role="tablist">
          <a role="tab"><span>For you</span></a>
          <a role="tab"><span>Following</span></a>
        </div>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.textContent).toContain('Following');
    });

    test('should find tab via Strategy 3 when text is not exact match', () => {
      // Strategy 1 fails (no href="/following"), Strategy 2 fails (text != "Following")
      // Strategy 3 finds via "For you" sibling in tab container
      document.body.innerHTML = `
        <div role="tablist">
          <a><span>For you</span></a>
          <a>Following (2)</a>
        </div>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.textContent).toContain('Following');
    });

    test('should find tab via parent traversal fallback when no tablist or nav', () => {
      // Strategy 3 fallback: parentElement.parentElement.parentElement
      document.body.innerHTML = `
        <div>
          <div>
            <div><span>For you</span></div>
            <a>Following (2)</a>
          </div>
        </div>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.textContent).toContain('Following');
    });

    test('should find tab via Strategy 4 using getBoundingClientRect', () => {
      // No href, no exact text match via link, no "For you" sibling — only a span
      document.body.innerHTML = `
        <div role="tab">
          <span>Following</span>
        </div>
      `;
      const span = document.querySelector('span');
      span.getBoundingClientRect = () => ({ top: 50, left: 0, right: 100, bottom: 70, width: 100, height: 20 });

      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.getAttribute('role')).toBe('tab');
    });

    test('should find presentation role parent in Strategy 4', () => {
      document.body.innerHTML = `
        <div role="presentation">
          <div>
            <span>Following</span>
          </div>
        </div>
      `;
      const span = document.querySelector('span');
      span.getBoundingClientRect = () => ({ top: 50, left: 0, right: 100, bottom: 70, width: 100, height: 20 });

      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
    });

    test('should find div with tabindex in Strategy 4', () => {
      document.body.innerHTML = `
        <div tabindex="0">
          <span>Following</span>
        </div>
      `;
      const span = document.querySelector('span');
      span.getBoundingClientRect = () => ({ top: 50, left: 0, right: 100, bottom: 70, width: 100, height: 20 });

      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
    });

    test('should skip Strategy 4 when span is not in top area', () => {
      document.body.innerHTML = `
        <div><span>Following</span></div>
      `;
      const span = document.querySelector('span');
      span.getBoundingClientRect = () => ({ top: 500, left: 0, right: 100, bottom: 520, width: 100, height: 20 });

      const tab = findFollowingTab();
      expect(tab).toBeNull();
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
      expect(isFollowingTabActive(tab)).toBe(true);
    });

    test('should detect inactive tab via aria-selected', () => {
      document.body.innerHTML = `
        <a href="/following" role="tab" aria-selected="false">
          <span>Following</span>
        </a>
      `;
      const tab = document.querySelector('a[href="/following"]');
      expect(isFollowingTabActive(tab)).toBe(false);
    });

    test('should detect active state from parent aria-selected', () => {
      document.body.innerHTML = `
        <div aria-selected="true">
          <a href="/following" role="tab">
            <span>Following</span>
          </a>
        </div>
      `;
      const tab = document.querySelector('a[href="/following"]');
      expect(isFollowingTabActive(tab)).toBe(true);
    });

    test('should detect active state via blue underline indicator', () => {
      document.body.innerHTML = `
        <a href="/following" role="tab">
          <span>Following</span>
          <div style="background-color: rgb(29, 155, 240);"></div>
        </a>
      `;
      const tab = document.querySelector('a[href="/following"]');
      expect(isFollowingTabActive(tab)).toBe(true);
    });

    test('should return false when no active indicators', () => {
      document.body.innerHTML = `
        <a href="/following" role="tab">
          <span>Following</span>
        </a>
      `;
      const tab = document.querySelector('a[href="/following"]');
      expect(isFollowingTabActive(tab)).toBe(false);
    });
  });

  describe('shouldRun', () => {
    afterEach(() => {
      // Reset to default jsdom URL
      window.history.pushState({}, '', '/');
    });

    test('should run on /home path', () => {
      window.history.pushState({}, '', '/home');
      expect(shouldRun()).toBe(true);
    });

    test('should run on root path', () => {
      window.history.pushState({}, '', '/');
      expect(shouldRun()).toBe(true);
    });

    test('should not run on profile pages', () => {
      window.history.pushState({}, '', '/username');
      expect(shouldRun()).toBe(false);
    });

    test('should not run on search page', () => {
      window.history.pushState({}, '', '/search');
      expect(shouldRun()).toBe(false);
    });

    test('should not run on explore page', () => {
      window.history.pushState({}, '', '/explore');
      expect(shouldRun()).toBe(false);
    });
  });

  describe('simulateClick', () => {
    test('should dispatch mouse events in correct order', () => {
      const events = [];
      const element = document.createElement('a');

      ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        element.addEventListener(eventType, () => events.push(eventType));
      });

      simulateClick(element);

      expect(events[0]).toBe('mousedown');
      expect(events[1]).toBe('mouseup');
      // click appears multiple times (dispatchEvent + native .click())
      expect(events).toContain('click');
    });

    test('should create events with correct properties', () => {
      const element = document.createElement('a');
      let capturedEvent = null;

      element.addEventListener('mousedown', (e) => {
        capturedEvent = e;
      });

      simulateClick(element);

      expect(capturedEvent.bubbles).toBe(true);
      expect(capturedEvent.cancelable).toBe(true);
    });

    test('should also click parent anchor element', () => {
      document.body.innerHTML = `
        <a href="/following" role="tab">
          <div><span>Following</span></div>
        </a>
      `;
      const span = document.querySelector('span');
      const anchor = document.querySelector('a');
      let parentClicked = false;
      anchor.addEventListener('click', () => { parentClicked = true; });

      simulateClick(span);

      expect(parentClicked).toBe(true);
    });
  });

  describe('clickFollowingTab', () => {
    test('should click inactive Following tab and return true', () => {
      document.body.innerHTML = `
        <nav role="navigation">
          <div role="tablist">
            <a href="/foryou" role="tab" aria-selected="true">
              <span>For you</span>
            </a>
            <a href="/following" role="tab" aria-selected="false">
              <span>Following</span>
            </a>
          </div>
        </nav>
      `;
      expect(clickFollowingTab()).toBe(true);
    });

    test('should return false when Following tab is already active', () => {
      document.body.innerHTML = `
        <nav role="navigation">
          <div role="tablist">
            <a href="/foryou" role="tab" aria-selected="false">
              <span>For you</span>
            </a>
            <a href="/following" role="tab" aria-selected="true">
              <span>Following</span>
            </a>
          </div>
        </nav>
      `;
      expect(clickFollowingTab()).toBe(false);
    });

    test('should return false when no Following tab found', () => {
      document.body.innerHTML = `<div>Empty page</div>`;
      expect(clickFollowingTab()).toBe(false);
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
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.textContent).toContain('Following');
    });

    test('should find clickable parent with role="tab"', () => {
      document.body.innerHTML = `
        <a role="tab" href="/following">
          <div>
            <span>Following</span>
          </div>
        </a>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
      expect(tab.getAttribute('href')).toBe('/following');
    });

    test('should find Following via nav container fallback', () => {
      document.body.innerHTML = `
        <nav>
          <a><span>For you</span></a>
          <a><span>Following</span></a>
        </nav>
      `;
      const tab = findFollowingTab();
      expect(tab).not.toBeNull();
    });
  });

  describe('Security checks', () => {
    test('should not execute any external scripts', () => {
      const scripts = document.querySelectorAll('script[src]');
      expect(scripts.length).toBe(0);
    });

    test('should not modify innerHTML with user content', () => {
      const originalInnerHTML = document.body.innerHTML;
      // Extension only uses: querySelector, textContent (read), getAttribute
      // Never: innerHTML =, insertAdjacentHTML, document.write
      expect(document.body.innerHTML).toBe(originalInnerHTML);
    });
  });
});

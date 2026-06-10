/**
 * DA AgriStat Hub — dropdown.js
 * Mega-dropdown toggles, hover sub-items, keyboard nav, outside click
 */

(function () {
  'use strict';

  let activeDropdown = null;

  function closeAllDropdowns() {
    document.querySelectorAll('.mega-dropdown.is-open').forEach((dd) => {
      dd.classList.remove('is-open');
    });
    document.querySelectorAll('.nav-hub-primary__btn[aria-expanded="true"]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
    });
    activeDropdown = null;
  }

  function openDropdown(btn, dropdown) {
    closeAllDropdowns();
    btn.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('is-open');
    activeDropdown = dropdown;

    const firstCategory = dropdown.querySelector('.mega-dropdown__desktop-category, .mega-dropdown__category-btn');
    if (firstCategory) {
      activateCategory(dropdown, firstCategory);
    }
  }

  function activateCategory(dropdown, categoryBtn) {
    const categoryId = categoryBtn.dataset.category;

    dropdown.querySelectorAll('.mega-dropdown__desktop-category, .mega-dropdown__category-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn === categoryBtn);
      if (btn.classList.contains('mega-dropdown__category-btn')) {
        btn.setAttribute('aria-expanded', btn === categoryBtn ? 'true' : 'false');
      }
    });

    /* Desktop panels */
    dropdown.querySelectorAll('.mega-dropdown__desktop-subitems-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.category === categoryId);
    });

    /* Mobile accordion */
    dropdown.querySelectorAll('.mega-dropdown__subitems').forEach((panel) => {
      const isMatch = panel.dataset.category === categoryId;
      panel.classList.toggle('is-visible', isMatch);
    });
  }

  function initDesktopDropdowns() {
    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

    document.querySelectorAll('.nav-hub-primary__item').forEach((item) => {
      const btn = item.querySelector('.nav-hub-primary__btn');
      const dropdown = item.querySelector('.mega-dropdown');
      if (!btn || !dropdown) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('is-open');
        isOpen ? closeAllDropdowns() : openDropdown(btn, dropdown);
      });

      /* Desktop hover on categories */
      dropdown.querySelectorAll('.mega-dropdown__desktop-category').forEach((catBtn) => {
        catBtn.addEventListener('mouseenter', () => {
          if (isDesktop()) activateCategory(dropdown, catBtn);
        });

        catBtn.addEventListener('focus', () => {
          activateCategory(dropdown, catBtn);
        });
      });

      /* Mobile accordion categories */
      dropdown.querySelectorAll('.mega-dropdown__category-btn').forEach((catBtn) => {
        catBtn.addEventListener('click', () => {
          if (isDesktop()) return;
          const isActive = catBtn.classList.contains('is-active');
          if (isActive) {
            catBtn.classList.remove('is-active');
            catBtn.setAttribute('aria-expanded', 'false');
            const panel = dropdown.querySelector(`.mega-dropdown__subitems[data-category="${catBtn.dataset.category}"]`);
            panel?.classList.remove('is-visible');
          } else {
            activateCategory(dropdown, catBtn);
          }
        });
      });

      /* Sub-item selection */
      dropdown.querySelectorAll('.mega-dropdown__subitem, .mega-dropdown__desktop-subitems-panel a').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const hash = link.dataset.hash || link.getAttribute('href');
          if (hash) {
            window.location.hash = hash.replace('#', '');
            closeAllDropdowns();

            dropdown.querySelectorAll('.mega-dropdown__subitem, .mega-dropdown__desktop-subitems-panel a').forEach((l) => {
              l.classList.remove('is-active');
            });
            link.classList.add('is-active');
          }
        });
      });
    });

    /* Outside click */
    document.addEventListener('click', (e) => {
      if (!activeDropdown) return;
      const nav = document.querySelector('.nav-hub-primary');
      if (nav && !nav.contains(e.target) && !activeDropdown.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    /* Escape key */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });

    /* Keyboard navigation within dropdown */
    document.addEventListener('keydown', (e) => {
      if (!activeDropdown) return;

      const categories = Array.from(
        activeDropdown.querySelectorAll('.mega-dropdown__desktop-category, .mega-dropdown__category-btn')
      );
      const focused = document.activeElement;
      const currentIndex = categories.indexOf(focused);

      if (e.key === 'ArrowDown' && currentIndex >= 0) {
        e.preventDefault();
        const next = categories[currentIndex + 1] || categories[0];
        next.focus();
        activateCategory(activeDropdown, next);
      }

      if (e.key === 'ArrowUp' && currentIndex >= 0) {
        e.preventDefault();
        const prev = categories[currentIndex - 1] || categories[categories.length - 1];
        prev.focus();
        activateCategory(activeDropdown, prev);
      }
    });
  }

  function initHubMobileAccordion() {
    const mobileNav = document.querySelector('.nav-hub-mobile');
    if (!mobileNav) return;

    mobileNav.querySelectorAll('.nav-hub-mobile__section-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.nav-hub-mobile__section');
        const content = section?.querySelector('.nav-hub-mobile__content');
        const isOpen = section?.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));

        if (content) {
          content.style.display = isOpen ? 'block' : 'none';
        }
      });
    });

    mobileNav.querySelectorAll('[data-hash]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = link.dataset.hash;
        if (hash) {
          window.location.hash = hash;
          mobileNav.classList.remove('is-open');
          document.body.style.overflow = '';
          const toggle = document.querySelector('.nav-hub-primary__toggle');
          toggle?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDesktopDropdowns();
      initHubMobileAccordion();
    });
  } else {
    initDesktopDropdowns();
    initHubMobileAccordion();
  }
})();

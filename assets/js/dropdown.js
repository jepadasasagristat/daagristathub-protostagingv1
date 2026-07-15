/**
 * DA AgriStat Hub — dropdown.js
 * Mega-dropdown toggles, subgroups, mobile drawer accordion
 *
 * Sections:
 * - initDesktopDropdowns()  → NAV: mega-dropdown (≥768px top bar)
 * - initSubgroups()           → NAV: collapsible .nav-subgroup accordion
 * - initHubMobileAccordion()  → NAV-MOBILE: #hub-mobile-nav drawer
 */

(function () {
  'use strict';

  let activeDropdown = null;

  /* ── NAV: Mega-dropdown open/close + category activation ── */
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

  function navigateToHash(hash, options) {
    const clean = (hash || '').replace(/^#/, '');
    if (!clean) return;

    window.location.hash = clean;

    if (options?.closeDropdown) {
      closeAllDropdowns();
    }
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

        catBtn.addEventListener('click', (e) => {
          if (!isDesktop()) return;
          e.stopPropagation();
          activateCategory(dropdown, catBtn);
          if (catBtn.dataset.hash) {
            navigateToHash(catBtn.dataset.hash, { closeDropdown: true });
          }
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
          if (catBtn.dataset.hash) {
            navigateToHash(catBtn.dataset.hash);
          }
        });
      });

      /* Sub-item selection */
      dropdown.querySelectorAll('.mega-dropdown__subitem, .mega-dropdown__desktop-subitems-panel a').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const hash = link.dataset.hash || link.getAttribute('href');
          if (hash) {
            navigateToHash(hash, { closeDropdown: true });

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

      if (e.key === 'Enter' && currentIndex >= 0) {
        const focusedCat = categories[currentIndex];
        if (focusedCat?.dataset.hash) {
          e.preventDefault();
          navigateToHash(focusedCat.dataset.hash, { closeDropdown: true });
        }
      }
    });
  }

  /* ── Collapsible subgroups (desktop mega-dropdown + mobile drawer) ── */
  function setSubgroupAccordion(subgroup, willOpen) {
    const container = subgroup?.parentElement;
    if (!container) return;

    container.querySelectorAll('.nav-subgroup').forEach((sibling) => {
      const isOpen = sibling === subgroup && willOpen;
      sibling.classList.toggle('is-open', isOpen);
      const toggle = sibling.querySelector('.nav-subgroup__toggle');
      if (toggle) toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initSubgroups() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-subgroup__toggle');
      if (!btn) return;

      e.stopPropagation();
      const subgroup = btn.closest('.nav-subgroup');
      if (!subgroup) return;

      const willOpen = !subgroup.classList.contains('is-open');
      setSubgroupAccordion(subgroup, willOpen);
    });
  }

  /* ── Mobile drawer: section / category accordion (#hub-mobile-nav) ── */
  function collapseMobileCategories(content) {
    content?.querySelectorAll('.nav-hub-mobile__category').forEach((category) => {
      const subitems = category.querySelector('.nav-hub-mobile__subitems');
      const catBtn = category.querySelector('.nav-hub-mobile__category-btn');
      subitems?.classList.remove('is-open');
      catBtn?.setAttribute('aria-expanded', 'false');
    });
  }

  function initHubMobileAccordion() {
    const mobileNav = document.querySelector('.nav-hub-mobile');
    if (!mobileNav) return;

    mobileNav.querySelectorAll('.nav-hub-mobile__section-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const section = btn.closest('.nav-hub-mobile__section');
        const content = section?.querySelector('.nav-hub-mobile__content');
        const willOpen = !section?.classList.contains('is-open');

        mobileNav.querySelectorAll('.nav-hub-mobile__section').forEach((sibling) => {
          const isOpen = sibling === section && willOpen;
          sibling.classList.toggle('is-open', isOpen);
          const sibBtn = sibling.querySelector('.nav-hub-mobile__section-btn');
          const sibContent = sibling.querySelector('.nav-hub-mobile__content');
          sibBtn?.setAttribute('aria-expanded', String(isOpen));
          if (sibContent) sibContent.style.display = isOpen ? 'block' : 'none';
          if (!isOpen) collapseMobileCategories(sibContent);
        });
      });
    });

    mobileNav.querySelectorAll('.nav-hub-mobile__category-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = btn.closest('.nav-hub-mobile__category');
        const content = category?.closest('.nav-hub-mobile__content');
        const subitems = category?.querySelector('.nav-hub-mobile__subitems');
        const willOpen = !subitems?.classList.contains('is-open');

        content?.querySelectorAll('.nav-hub-mobile__category').forEach((sibling) => {
          const isOpen = sibling === category && willOpen;
          const sibSubitems = sibling.querySelector('.nav-hub-mobile__subitems');
          const sibBtn = sibling.querySelector('.nav-hub-mobile__category-btn');
          sibSubitems?.classList.toggle('is-open', isOpen);
          sibBtn?.setAttribute('aria-expanded', String(isOpen));
        });

        if (btn.dataset.hash) {
          navigateToHash(btn.dataset.hash);
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
      initSubgroups();
      initHubMobileAccordion();
    });
  } else {
    initDesktopDropdowns();
    initSubgroups();
    initHubMobileAccordion();
  }
})();

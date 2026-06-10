/**
 * DA AgriStat Hub — main.js
 * Global: mobile nav, scroll effects, parallax, page load
 */

(function () {
  'use strict';

  /* Page load fade-in */
  function initPageLoad() {
    document.body.classList.add('loaded');
  }

  /* Main nav scroll shrink */
  function initNavScroll() {
    const nav = document.querySelector('.nav-main');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile hamburger menu */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-main__toggle');
    const drawer = document.querySelector('.nav-main__drawer');
    const overlay = document.querySelector('.nav-main__drawer-overlay');

    if (!toggle || !drawer) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      overlay?.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      overlay?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });

    overlay?.addEventListener('click', close);

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
      }
    });
  }

  /* Hero parallax (desktop only) */
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (prefersReduced || isMobile) return;

    const onScroll = () => {
      const offset = window.scrollY * 0.3;
      document.documentElement.style.setProperty('--parallax-offset', `${offset}px`);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Scroll entrance animations */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* Hub mobile nav toggle */
  function initHubMobileNav() {
    const toggle = document.querySelector('.nav-hub-primary__toggle');
    const mobileNav = document.querySelector('.nav-hub-mobile');

    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  /* Init */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initPageLoad();
    initNavScroll();
    initMobileNav();
    initParallax();
    initScrollAnimations();
    initHubMobileNav();
  }
})();

/**
 * DA AgriStat Hub — counter.js
 * Hero stat counter animation via IntersectionObserver
 */

(function () {
  'use strict';

  function formatValue(value, format) {
    switch (format) {
      case 'currency':
        return '₱' + value.toFixed(2) + ' Trillion';
      case 'million':
        return value.toFixed(1) + ' Million';
      case 'hectares':
        return value.toFixed(1) + ' Million ha';
      default:
        return value.toLocaleString();
    }
  }

  function animateCounter(element, target, format, duration) {
    const start = performance.now();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      element.textContent = formatValue(target, format);
      return;
    }

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      element.textContent = formatValue(current, format);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const items = document.querySelectorAll('[data-counter]');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const format = el.dataset.format || 'default';
          const duration = parseInt(el.dataset.duration, 10) || 2000;

          animateCounter(el, target, format, duration);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    items.forEach((item) => observer.observe(item));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();

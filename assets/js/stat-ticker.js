/**
 * DA AgriStat Hub — stat-ticker.js
 * HOME: Hero stat carousel (index.html — [data-stat-ticker])
 *
 * Shows 3 stats at a time; horizontal loop on desktop, vertical loop on mobile.
 * Auto-advances, pauses on hover, supports drag navigation.
 */

(function () {
  'use strict';

  const AUTOPLAY_MS = 4500;
  const TRANSITION_MS = 650;
  const VISIBLE_COUNT = 3;

  function formatValue(value, format) {
    switch (format) {
      case 'currency':
        return '₱' + value.toFixed(2) + ' Trillion';
      case 'currency-million':
        return '₱' + value.toFixed(2) + ' Million';
      case 'million':
        return value.toFixed(2) + ' Million';
      case 'hectares':
        return value.toFixed(2) + ' Million ha';
      default:
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
  }

  function getFinalCounterText(el) {
    const target = parseFloat(el.dataset.counter);
    const format = el.dataset.format || 'default';

    if (!Number.isNaN(target)) {
      return formatValue(target, format);
    }

    return el.textContent;
  }

  function freezeCounterDisplay(el) {
    el.textContent = getFinalCounterText(el);
    el.removeAttribute('data-counter');
    el.removeAttribute('data-format');
    el.removeAttribute('data-duration');
  }

  function cloneItem(item) {
    const clone = item.cloneNode(true);
    const sourceValue = item.querySelector('.stat-ticker__value');
    const cloneValue = clone.querySelector('.stat-ticker__value');

    if (sourceValue && cloneValue) {
      cloneValue.textContent = getFinalCounterText(sourceValue);
      freezeCounterDisplay(cloneValue);
    }

    clone.setAttribute('aria-hidden', 'true');
    return clone;
  }

  function initStatTicker(root) {
    const viewport = root.querySelector('.stat-ticker__viewport');
    const track = root.querySelector('.stat-ticker__track');
    const originals = Array.from(track.querySelectorAll('.stat-ticker__item'));

    if (!viewport || !track || originals.length === 0) return;

    let index = 0;
    let startIndex = 0;
    let endIndex = 0;
    let autoplayTimer = null;
    let isPaused = false;
    let isDragging = false;
    let dragStart = null;
    let dragDelta = 0;
    let transitionTimer = null;
    let isVertical = false;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mqDesktop = window.matchMedia('(min-width: 768px)');

    function clearClones() {
      track.querySelectorAll('.stat-ticker__item[aria-hidden="true"]').forEach((node) => node.remove());
    }

    function buildTrack() {
      clearClones();

      const count = originals.length;
      const lead = originals.slice(count - VISIBLE_COUNT).map(cloneItem);
      const trail = originals.slice(0, VISIBLE_COUNT).map(cloneItem);

      lead.forEach((node) => track.insertBefore(node, originals[0]));
      trail.forEach((node) => track.appendChild(node));

      startIndex = VISIBLE_COUNT;
      endIndex = startIndex + count;
      index = startIndex;
    }

    function refreshCloneValues() {
      track.querySelectorAll('.stat-ticker__item[aria-hidden="true"]').forEach((clone) => {
        const label = clone.querySelector('.stat-ticker__label')?.textContent.trim();
        const original = originals.find(
          (item) => item.querySelector('.stat-ticker__label')?.textContent.trim() === label
        );
        const sourceValue = original?.querySelector('.stat-ticker__value');
        const cloneValue = clone.querySelector('.stat-ticker__value');

        if (!sourceValue || !cloneValue) return;

        const liveText = sourceValue.textContent.trim();
        const isPlaceholder = /^₱0\.00|^0\.0/.test(liveText);
        cloneValue.textContent = isPlaceholder ? getFinalCounterText(sourceValue) : liveText;
        freezeCounterDisplay(cloneValue);
      });
    }

    function getOffsetPercent() {
      return index * (100 / VISIBLE_COUNT);
    }

    function applyTransform(offsetPercent, dragPx, animate) {
      if (!animate) {
        track.classList.add('is-instant');
      }

      if (isVertical) {
        track.style.transform =
          dragPx !== null
            ? `translate3d(0, calc(-${offsetPercent}% + ${dragPx}px), 0)`
            : `translate3d(0, -${offsetPercent}%, 0)`;
      } else {
        track.style.transform =
          dragPx !== null
            ? `translate3d(calc(-${offsetPercent}% + ${dragPx}px), 0, 0)`
            : `translate3d(-${offsetPercent}%, 0, 0)`;
      }

      if (!animate) {
        requestAnimationFrame(() => {
          track.classList.remove('is-instant');
        });
      }
    }

    function setTransform(nextIndex, animate) {
      index = nextIndex;
      applyTransform(getOffsetPercent(), null, animate);
    }

    function applyLayout() {
      isVertical = !mqDesktop.matches;
      root.classList.toggle('is-vertical', isVertical);
      root.style.setProperty('--stat-ticker-visible', String(VISIBLE_COUNT));
      buildTrack();
      setTransform(startIndex, false);
    }

    function normalizeIndex() {
      const count = originals.length;

      if (index >= endIndex) {
        index -= count;
        refreshCloneValues();
        setTransform(index, false);
      } else if (index < startIndex) {
        index += count;
        refreshCloneValues();
        setTransform(index, false);
      }
    }

    function goTo(nextIndex) {
      if (isDragging) return;

      setTransform(nextIndex, true);

      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        normalizeIndex();
      }, TRANSITION_MS);
    }

    function step(direction) {
      goTo(index + direction);
      restartAutoplay();
    }

    function startAutoplay() {
      if (prefersReduced || originals.length <= VISIBLE_COUNT) return;

      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        if (!isPaused && !isDragging) {
          step(1);
        }
      }, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    root.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    root.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      isDragging = true;
      isPaused = true;
      dragStart = isVertical ? event.clientY : event.clientX;
      dragDelta = 0;
      track.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!isDragging || dragStart === null) return;

      const current = isVertical ? event.clientY : event.clientX;
      dragDelta = current - dragStart;
      applyTransform(getOffsetPercent(), dragDelta, false);
    });

    function finishDrag() {
      if (!isDragging) return;

      isDragging = false;
      dragStart = null;
      track.classList.remove('is-dragging');
      isPaused = false;

      const threshold = (isVertical ? viewport.offsetHeight : viewport.offsetWidth) * 0.12;

      if (dragDelta <= -threshold) {
        dragDelta = 0;
        step(1);
        return;
      }

      if (dragDelta >= threshold) {
        dragDelta = 0;
        step(-1);
        return;
      }

      dragDelta = 0;
      setTransform(index, true);
      restartAutoplay();
    }

    viewport.addEventListener('pointerup', (event) => {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (_) {
        /* pointer already released */
      }
      finishDrag();
    });

    viewport.addEventListener('pointercancel', finishDrag);

    track.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'transform' || isDragging) return;
      normalizeIndex();
    });

    mqDesktop.addEventListener('change', applyLayout);
    window.addEventListener('resize', applyLayout);

    applyLayout();
    startAutoplay();
  }

  function init() {
    document.querySelectorAll('[data-stat-ticker]').forEach(initStatTicker);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

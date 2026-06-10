/**
 * DA AgriStat Hub — embed.js
 * Hash → embed URL mapping, skeleton loader, iframe injection, fullscreen
 */

(function () {
  'use strict';

  const EMBED_REGISTRY = window.EMBED_REGISTRY || {};
  const PENDING_DELAY_MS = 400;

  const TYPE_META = {
    dashboard: {
      badge: 'Dashboard',
      label: 'dashboard',
    },
    map: {
      badge: 'Geospatial Map',
      label: 'geospatial map',
    },
    table: {
      badge: 'Raw Data Table',
      label: 'raw data table',
    },
  };

  function getElements() {
    return {
      container: document.querySelector('.embed-container'),
      placeholder: document.querySelector('.embed-placeholder'),
      skeleton: document.querySelector('.embed-skeleton'),
      pending: document.querySelector('.embed-pending'),
      fullscreenBtn: document.querySelector('.embed-fullscreen-btn'),
    };
  }

  function showSkeleton() {
    const { skeleton, placeholder, pending } = getElements();
    skeleton?.classList.add('is-visible');
    placeholder?.classList.add('is-hidden');
    pending?.classList.add('is-hidden');
  }

  function hideSkeleton() {
    const { skeleton } = getElements();
    skeleton?.classList.remove('is-visible');
  }

  function removeIframe() {
    const { container } = getElements();
    const existing = container?.querySelector('.embed-iframe');
    if (existing) existing.remove();
  }

  function hideIntegrationPending() {
    const { pending } = getElements();
    pending?.classList.add('is-hidden');
    pending?.classList.remove('is-visible');
  }

  function showPlaceholder() {
    const { placeholder, fullscreenBtn } = getElements();
    removeIframe();
    hideSkeleton();
    hideIntegrationPending();
    placeholder?.classList.remove('is-hidden');
    fullscreenBtn?.classList.remove('is-visible');
  }

  function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META.dashboard;
  }

  function showIntegrationPending(config) {
    const { placeholder, fullscreenBtn, pending } = getElements();
    const type = config.type || 'dashboard';
    const meta = getTypeMeta(type);

    removeIframe();
    placeholder?.classList.add('is-hidden');
    fullscreenBtn?.classList.remove('is-visible');

    if (!pending) return;

    const titleEl = pending.querySelector('.embed-pending__title');
    const badgeEl = pending.querySelector('.embed-pending__badge');
    const messageEl = pending.querySelector('.embed-pending__message');

    if (titleEl) titleEl.textContent = config.title || 'Selected Item';
    if (badgeEl) badgeEl.textContent = meta.badge;
    if (messageEl) {
      messageEl.textContent =
        'This ' + meta.label + ' is currently being integrated into AgriStat Hub. Check back soon for live data.';
    }

    pending.classList.remove('embed-pending--dashboard', 'embed-pending--map', 'embed-pending--table');
    pending.classList.add('embed-pending--' + type);

    hideSkeleton();
    pending.classList.remove('is-hidden');
    requestAnimationFrame(() => {
      pending.classList.add('is-visible');
    });
  }

  function loadLiveEmbed(config) {
    const { container, fullscreenBtn } = getElements();

    hideIntegrationPending();
    removeIframe();

    const iframe = document.createElement('iframe');
    iframe.className = 'embed-iframe';
    iframe.title = config.title || 'Dashboard';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowfullscreen', 'true');

    iframe.addEventListener('load', () => {
      hideSkeleton();
      iframe.classList.add('is-loaded');
      fullscreenBtn?.classList.add('is-visible');
    });

    iframe.src = config.url;
    container.appendChild(iframe);
  }

  function loadEmbed(hash) {
    const config = EMBED_REGISTRY[hash];
    const { container } = getElements();

    if (!config || !container) {
      showPlaceholder();
      return;
    }

    showSkeleton();
    getElements().placeholder?.classList.add('is-hidden');
    hideIntegrationPending();
    removeIframe();

    if (!config.url) {
      window.setTimeout(() => {
        showIntegrationPending(config);
      }, PENDING_DELAY_MS);
      return;
    }

    loadLiveEmbed(config);
  }

  function initHashRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        loadEmbed(hash);
      } else {
        showPlaceholder();
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  function initFullscreen() {
    const btn = document.querySelector('.embed-fullscreen-btn');
    const container = document.querySelector('.embed-container');
    if (!btn || !container) return;

    btn.addEventListener('click', () => {
      const isFullscreen = container.classList.toggle('is-fullscreen');
      btn.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
      btn.setAttribute('aria-pressed', String(isFullscreen));

      const enterIcon = btn.querySelector('.icon-enter');
      const exitIcon = btn.querySelector('.icon-exit');
      if (enterIcon && exitIcon) {
        enterIcon.style.display = isFullscreen ? 'none' : 'block';
        exitIcon.style.display = isFullscreen ? 'block' : 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container.classList.contains('is-fullscreen')) {
        container.classList.remove('is-fullscreen');
        btn.setAttribute('aria-label', 'Enter fullscreen');
        btn.setAttribute('aria-pressed', 'false');
        const enterIcon = btn.querySelector('.icon-enter');
        const exitIcon = btn.querySelector('.icon-exit');
        if (enterIcon && exitIcon) {
          enterIcon.style.display = 'block';
          exitIcon.style.display = 'none';
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHashRouting();
      initFullscreen();
    });
  } else {
    initHashRouting();
    initFullscreen();
  }
})();

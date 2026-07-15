/**
 * DA AgriStat Hub — embed.js
 * EMBED VIEWER: hash routing → live iframe | pending | placeholder
 *
 * Reads window.EMBED_REGISTRY from psa.html / da-ops.html
 * Sections:
 * - loadEmbed()              → resolve hash to embed state
 * - showIntegrationPending() → EMBED: pending (no url in registry)
 * - loadLiveEmbed()          → EMBED: live iframe
 * - initFullscreen()         → EMBED: fullscreen toggle
 * - preliminary notice       → EMBED: live embed data advisory modal
 */

(function () {
  'use strict';

  const EMBED_REGISTRY = window.EMBED_REGISTRY || {};
  const PENDING_DELAY_MS = 400;

  /* ── EMBED: Type labels for pending panel (dashboard | map | table) ── */
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

  /* ── EMBED: UI state helpers (placeholder / skeleton / pending / iframe) ── */
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
    hidePreliminaryNotice();
    removeIframe();
    hideSkeleton();
    hideIntegrationPending();
    placeholder?.classList.remove('is-hidden');
    fullscreenBtn?.classList.remove('is-visible');
  }

  function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META.dashboard;
  }

  /* ── EMBED: Preliminary 2026 data notice (live embeds only) ── */
  let preliminaryNoticeEl = null;
  let preliminaryNoticeDismiss = null;

  function initPreliminaryNotice() {
    const { container } = getElements();
    if (!container || preliminaryNoticeEl) return;

    preliminaryNoticeEl = document.createElement('div');
    preliminaryNoticeEl.className = 'embed-notice is-hidden';
    preliminaryNoticeEl.setAttribute('role', 'dialog');
    preliminaryNoticeEl.setAttribute('aria-modal', 'true');
    preliminaryNoticeEl.setAttribute('aria-labelledby', 'embed-notice-title');
    preliminaryNoticeEl.innerHTML =
      '<div class="embed-notice__backdrop" data-notice-dismiss aria-hidden="true"></div>' +
      '<div class="embed-notice__card">' +
      '<span class="embed-notice__badge">Data Advisory</span>' +
      '<h2 class="embed-notice__title" id="embed-notice-title">Preliminary 2026 Data</h2>' +
      '<p class="embed-notice__message"></p>' +
      '<button type="button" class="embed-notice__btn" data-notice-dismiss>Continue to dashboard</button>' +
      '</div>';

    container.appendChild(preliminaryNoticeEl);

    preliminaryNoticeDismiss = () => hidePreliminaryNotice();

    preliminaryNoticeEl.querySelectorAll('[data-notice-dismiss]').forEach((el) => {
      el.addEventListener('click', preliminaryNoticeDismiss);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && preliminaryNoticeEl && !preliminaryNoticeEl.classList.contains('is-hidden')) {
        preliminaryNoticeDismiss();
      }
    });
  }

  function getHubContext() {
    if (document.body.classList.contains('hub-page--da')) return 'da';
    return 'psa';
  }

  function getPreliminaryNoticeContent(type) {
    const meta = getTypeMeta(type);
    const hub = getHubContext();

    if (hub === 'da') {
      return {
        title: 'Partial 2026 Data',
        message:
          'Statistics and figures shown in this ' +
          meta.label +
          ' include <strong>2026 data that are partial</strong> and cover only the period up to the current reported date.',
      };
    }

    return {
      title: 'Preliminary 2026 Data',
      message:
        'Statistics and figures shown in this ' +
        meta.label +
        ' which includes <strong>2026 data that are still preliminary</strong> and subject to revision.',
    };
  }

  function showPreliminaryNotice(config) {
    initPreliminaryNotice();
    if (!preliminaryNoticeEl) return;

    const messageEl = preliminaryNoticeEl.querySelector('.embed-notice__message');
    const titleEl = preliminaryNoticeEl.querySelector('.embed-notice__title');
    const btnEl = preliminaryNoticeEl.querySelector('.embed-notice__btn');
    const type = config.type || 'dashboard';
    const meta = getTypeMeta(type);
    const content = getPreliminaryNoticeContent(type);

    if (titleEl) {
      titleEl.textContent = content.title;
    }
    if (messageEl) {
      messageEl.innerHTML = content.message;
    }
    if (btnEl) {
      btnEl.textContent = 'Continue to ' + meta.label;
    }

    preliminaryNoticeEl.classList.remove('is-hidden');
    requestAnimationFrame(() => {
      preliminaryNoticeEl.classList.add('is-visible');
      btnEl?.focus();
    });
  }

  function hidePreliminaryNotice() {
    if (!preliminaryNoticeEl) return;

    preliminaryNoticeEl.classList.remove('is-visible');
    preliminaryNoticeEl.classList.add('is-hidden');
  }

  function showIntegrationPending(config) {
    const { placeholder, fullscreenBtn, pending } = getElements();
    hidePreliminaryNotice();
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

  function resolveEmbedUrl(url) {
    if (!url || !/powerbi\.com/i.test(url)) return url;

    try {
      const parsed = new URL(url);
      if (!parsed.searchParams.has('pageView')) {
        parsed.searchParams.set('pageView', 'FitToWidth');
      }
      return parsed.toString();
    } catch (_) {
      if (/[?&]pageView=/i.test(url)) return url;
      return url + (url.includes('?') ? '&' : '?') + 'pageView=FitToWidth';
    }
  }

  function loadLiveEmbed(config) {
    const { container, fullscreenBtn } = getElements();

    hideIntegrationPending();
    removeIframe();
    showPreliminaryNotice(config);

    const iframe = document.createElement('iframe');
    iframe.className = 'embed-iframe';
    if (/powerbi\.com/i.test(config.url || '')) {
      iframe.classList.add('embed-iframe--powerbi');
    }
    iframe.title = config.iframeTitle || config.title || 'Dashboard';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowFullScreen', 'true');
    iframe.allowFullscreen = true;

    iframe.addEventListener('load', () => {
      hideSkeleton();
      iframe.classList.add('is-loaded');
      fullscreenBtn?.classList.add('is-visible');
    });

    iframe.src = resolveEmbedUrl(config.url);
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

  /* ── Breadcrumb: Home › Hub › section › category › subgroup › item ── */
  function normalizeLabel(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function getLinkLabel(link) {
    const clone = link.cloneNode(true);
    clone.querySelectorAll('.commodity').forEach((el) => el.remove());
    return normalizeLabel(clone.textContent);
  }

  function getSectionFromDropdown(dropdown) {
    const btn = dropdown?.closest('.nav-hub-primary__item')?.querySelector('.nav-hub-primary__btn');
    return normalizeLabel(btn?.textContent);
  }

  function getCategoryFromDesktopPanel(panel) {
    const categoryId = panel?.dataset.category;
    const dropdown = panel?.closest('.mega-dropdown');
    const catBtn = dropdown?.querySelector(
      `.mega-dropdown__desktop-category[data-category="${categoryId}"]`
    );
    if (catBtn) return normalizeLabel(catBtn.textContent);
    return normalizeLabel(panel?.querySelector('h4')?.textContent);
  }

  function trailFromCategoryEl(el) {
    const label = normalizeLabel(el.textContent);
    let section = '';

    const mega = el.closest('.mega-dropdown');
    if (mega) {
      section = getSectionFromDropdown(mega);
    } else {
      const mobileSection = el.closest('.nav-hub-mobile__section');
      section = normalizeLabel(
        mobileSection?.querySelector('.nav-hub-mobile__section-btn')?.textContent
      );
    }

    return {
      section,
      category: label,
      subgroup: '',
      subitem: '',
    };
  }

  function trailFromLink(link) {
    if (
      link.matches(
        '.mega-dropdown__desktop-category, .mega-dropdown__category-btn, .nav-hub-mobile__category-btn'
      )
    ) {
      return trailFromCategoryEl(link);
    }

    const mobileSection = link.closest('.nav-hub-mobile__section');
    const megaCategory = link.closest('.mega-dropdown__category');
    const desktopPanel = link.closest('.mega-dropdown__desktop-subitems-panel');
    const mobileCategory = link.closest('.nav-hub-mobile__category');
    const subgroup = normalizeLabel(
      link.closest('.nav-subgroup')?.querySelector('.nav-subgroup__toggle')?.textContent
    );

    let section = '';
    let category = '';

    if (mobileSection) {
      section = normalizeLabel(
        mobileSection.querySelector('.nav-hub-mobile__section-btn')?.textContent
      );
      category = normalizeLabel(
        mobileCategory?.querySelector('.nav-hub-mobile__category-btn')?.textContent
      );
    } else if (megaCategory) {
      section = getSectionFromDropdown(link.closest('.mega-dropdown'));
      category = normalizeLabel(
        megaCategory.querySelector('.mega-dropdown__category-btn')?.textContent
      );
    } else if (desktopPanel) {
      section = getSectionFromDropdown(link.closest('.mega-dropdown'));
      category = getCategoryFromDesktopPanel(desktopPanel);
    }

    return {
      section,
      category,
      subgroup,
      subitem: getLinkLabel(link),
    };
  }

  function resolveNavTrail(hash) {
    const links = document.querySelectorAll(`[data-hash="${hash}"]`);
    let best = null;

    links.forEach((link) => {
      const trail = trailFromLink(link);
      const isCategoryLevel = !trail.subitem && trail.section && trail.category;
      const isLeaf = Boolean(trail.subitem);

      if (!isCategoryLevel && !isLeaf) return;

      if (isLeaf && trail.section && trail.category) {
        best = trail;
      } else if (isLeaf && !best) {
        best = trail;
      } else if (isCategoryLevel && !best) {
        best = trail;
      }
    });

    return best;
  }

  function appendBreadcrumbPart(nav, node) {
    const sep = document.createElement('span');
    sep.className = 'separator';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '›';
    nav.appendChild(sep);
    nav.appendChild(node);
  }

  function updateBreadcrumb(hash) {
    const nav = document.querySelector('.nav-hub-brand__breadcrumb');
    if (!nav) return;

    const hubName = nav.dataset.hubName || 'Hub';
    const hubHref = window.location.pathname.split('/').pop() || 'index.html';

    nav.replaceChildren();

    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';
    nav.appendChild(homeLink);

    if (!hash) {
      const hubCurrent = document.createElement('span');
      hubCurrent.setAttribute('aria-current', 'page');
      hubCurrent.textContent = hubName;
      appendBreadcrumbPart(nav, hubCurrent);
      return;
    }

    const hubLink = document.createElement('a');
    hubLink.href = hubHref;
    hubLink.textContent = hubName;
    appendBreadcrumbPart(nav, hubLink);

    const trail = resolveNavTrail(hash);
    const registryTitle = EMBED_REGISTRY[hash]?.title;
    const segments = trail
      ? [trail.section, trail.category, trail.subgroup, trail.subitem].filter(Boolean)
      : registryTitle
        ? [registryTitle]
        : [hash];

    segments.forEach((label, index) => {
      const isLast = index === segments.length - 1;
      const el = document.createElement('span');
      el.textContent = label;
      if (isLast) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.className = 'nav-hub-brand__crumb';
      }
      appendBreadcrumbPart(nav, el);
    });
  }

  /* ── EMBED: Hash routing (#slug → registry lookup) ── */
  function initHashRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      updateBreadcrumb(hash);
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
      initPreliminaryNotice();
      initHashRouting();
      initFullscreen();
    });
  } else {
    initPreliminaryNotice();
    initHashRouting();
    initFullscreen();
  }
})();

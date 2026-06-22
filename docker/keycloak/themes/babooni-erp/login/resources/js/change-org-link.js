/**
 * Enlace «Cambiar organización» en login/logout Keycloak — todos los tenants.
 * Hub ERP: /auth/tenant (desde redirect_uri del cliente OIDC).
 */
(function () {
  const ERP_TENANT_PATH = '/auth/tenant';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function resolveHubUrl() {
    const redirectUri = new URLSearchParams(window.location.search).get('redirect_uri');
    if (redirectUri) {
      try {
        const u = new URL(redirectUri);
        if (u.port === '4300') {
          return u.protocol + '//' + u.hostname + ':4200' + ERP_TENANT_PATH;
        }
        return u.origin + ERP_TENANT_PATH;
      } catch (_err) {
        /* ignore */
      }
    }
    return window.location.protocol + '//' + window.location.hostname + ':4200' + ERP_TENANT_PATH;
  }

  function resolveTenantSlug() {
    const realm = (window.location.pathname.match(/\/realms\/([^/]+)/) || [])[1] || '';
    const clientId = new URLSearchParams(window.location.search).get('client_id') || '';
    const byClient = {
      'josanz-figma-spa': 'alexis',
      'josanz-web-app-spa': 'josanz',
    };
    if (byClient[clientId]) {
      return byClient[clientId];
    }
    if (realm === 'babooni-tenant') {
      return 'babooni';
    }
    if (realm === 'babooni-platform') {
      return 'platform';
    }
    return '';
  }

  function findAnchor() {
    return (
      document.getElementById('kc-form-login') ||
      document.getElementById('kc-form-buttons') ||
      document.getElementById('kc-content') ||
      document.querySelector('.pf-v5-c-login__main-body') ||
      document.querySelector('.pf-v5-c-login__main') ||
      document.querySelector('#kc-error-message') ||
      document.querySelector('.instruction')
    );
  }

  function injectChangeOrgLink() {
    if (document.getElementById('kc-change-org-link')) {
      return true;
    }

    const anchor = findAnchor();
    if (!anchor) {
      return false;
    }

    const slug = resolveTenantSlug();
    const hubUrl = resolveHubUrl();
    const wrap = document.createElement('div');
    wrap.id = 'kc-change-org-link';
    wrap.className = 'kc-change-org-link';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'Organización');

    let inner = '';
    if (slug) {
      inner +=
        '<span class="kc-change-org-link__pill">Organización · ' +
        escapeHtml(slug) +
        '</span>';
    }
    inner +=
      '<a class="kc-change-org-link__action" href="' +
      escapeHtml(hubUrl) +
      '">Cambiar organización</a>';
    wrap.innerHTML = inner;

    if (anchor.id === 'kc-form-login' || anchor.id === 'kc-form-buttons') {
      anchor.insertAdjacentElement('beforebegin', wrap);
    } else if (anchor.classList && anchor.classList.contains('instruction')) {
      anchor.insertAdjacentElement('afterend', wrap);
    } else {
      anchor.prepend(wrap);
    }

    markLightLoginCardIfNeeded();

    return true;
  }

  /** Realm con tema claro (josanz-figma). */
  function markLightLoginCardIfNeeded() {
    const main = document.querySelector('.pf-v5-c-login__main');
    if (!main || main.classList.contains('pf-v5-c-login__main--light')) {
      return;
    }
    const realm = (window.location.pathname.match(/\/realms\/([^/]+)/) || [])[1] || '';
    if (realm === 'josanz-web-app-realm') {
      main.classList.add('pf-v5-c-login__main--light');
    }
  }

  function boot() {
    markLightLoginCardIfNeeded();
    if (injectChangeOrgLink()) {
      return;
    }
    setTimeout(injectChangeOrgLink, 60);
    setTimeout(injectChangeOrgLink, 200);
    setTimeout(injectChangeOrgLink, 500);
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function () {
        if (injectChangeOrgLink()) {
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () {
        observer.disconnect();
      }, 3000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

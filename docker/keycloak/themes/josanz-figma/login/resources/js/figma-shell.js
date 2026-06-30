/**
 * Shell Figma en Keycloak: fuerza tema claro, detecta reset-credentials, oculta hub en standalone.
 */
(function () {
  function isResetCredentialsPage() {
    return window.location.pathname.includes('reset-credentials');
  }

  function isStandaloneApp() {
    const redirectUri = new URLSearchParams(window.location.search).get('redirect_uri') || '';
    try {
      const u = new URL(redirectUri);
      return u.port === '4300';
    } catch {
      return redirectUri.includes(':4300');
    }
  }

  function applyLightShell() {
    const main = document.querySelector('.pf-v5-c-login__main');
    if (main) {
      main.classList.add('pf-v5-c-login__main--light', 'kc-theme-light');
    }
  }

  function applyPageMode() {
    if (isResetCredentialsPage()) {
      document.documentElement.classList.add('kc-reset-password-flow');
      document.documentElement.setAttribute('data-kc-page', 'login-reset-password');
    }
  }

  function hideOrgLinkIfNeeded() {
    if (!isResetCredentialsPage() && !isStandaloneApp()) {
      return;
    }
    const org = document.getElementById('kc-change-org-link');
    if (org) {
      org.style.display = 'none';
    }
  }

  function boot() {
    applyLightShell();
    applyPageMode();
    hideOrgLinkIfNeeded();
    setTimeout(hideOrgLinkIfNeeded, 100);
    setTimeout(hideOrgLinkIfNeeded, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

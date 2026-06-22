/**
 * Cuentas demo en login Keycloak — solo localhost.
 * Mantener alineado con libs/.../dev-tenant-login-hints.ts
 */
(function () {
  const DEV_PASSWORD = 'Admin123!';
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

  if (!LOCAL_HOSTS.has(window.location.hostname)) {
    return;
  }

  /** realm → clientId (opcional) → cuentas */
  const CONFIG = {
    'josanz-web-app-realm': {
      'josanz-web-app-spa': {
        slug: 'josanz',
        primary: { email: 'admin@josanz.com' },
        alternates: [
          { email: 'dani@josanz.com' },
          { email: 'alex@josanz.com' },
          { email: 'admin@josanz-erp.local', note: 'solo login local ERP' },
        ],
      },
      'josanz-figma-spa': {
        slug: 'alexis',
        primary: { email: 'admin@alexis.local' },
        alternates: [],
      },
      default: {
        slug: 'josanz',
        primary: { email: 'admin@josanz.com' },
        alternates: [{ email: 'admin@alexis.local', note: 'tenant alexis' }],
      },
    },
    'babooni-tenant': {
      default: {
        slug: 'babooni',
        primary: { email: 'root@babooni.com' },
        alternates: [
          { email: 'alvaro.ballesteros@babooni.com' },
          { email: 'florina.mahalean@babooni.com' },
          { email: 'alejandro.ballesteros@babooni.com' },
          { email: 'angel.nieto@babooni.com' },
        ],
      },
    },
    'babooni-platform': {
      default: {
        slug: 'platform',
        primary: { email: 'platform@babooni.com' },
        alternates: [],
      },
    },
  };

  function getRealm() {
    const match = window.location.pathname.match(/\/realms\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function getClientId() {
    return new URLSearchParams(window.location.search).get('client_id') || '';
  }

  function resolveAccountConfig() {
    const realmCfg = CONFIG[getRealm()];
    if (!realmCfg) {
      return null;
    }
    const clientId = getClientId();
    return realmCfg[clientId] || realmCfg.default || null;
  }

  function findUsernameInput() {
    return (
      document.getElementById('username') ||
      document.querySelector('#kc-form-login input[name="username"]') ||
      document.querySelector('input[name="username"]') ||
      document.querySelector('input[type="email"]')
    );
  }

  function findPasswordInput() {
    return (
      document.getElementById('password') ||
      document.querySelector('#kc-form-login input[name="password"]') ||
      document.querySelector('input[name="password"]')
    );
  }

  function setInputValue(input, value) {
    if (!input) {
      return;
    }
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillAccount(email) {
    setInputValue(findUsernameInput(), email);
    setInputValue(findPasswordInput(), DEV_PASSWORD);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function injectDevPanel(cfg) {
    if (document.getElementById('kc-dev-login-hint')) {
      return;
    }

    const anchor =
      document.querySelector('.pf-v5-c-login__main') ||
      document.getElementById('kc-form-buttons') ||
      document.getElementById('kc-form-login') ||
      document.querySelector('.pf-v5-c-login__main-body');

    if (!anchor) {
      return;
    }

    const panel = document.createElement('details');
    panel.id = 'kc-dev-login-hint';
    panel.className = 'kc-dev-login-hint';
    panel.open = false;

    const altItems = (cfg.alternates || [])
      .map(function (alt) {
        const note = alt.note
          ? ' <span class="kc-dev-login-hint__note">' + escapeHtml(alt.note) + '</span>'
          : '';
        return (
          '<li><button type="button" class="kc-dev-login-hint__pick" data-email="' +
          escapeHtml(alt.email) +
          '"><code>' +
          escapeHtml(alt.email) +
          '</code></button>' +
          note +
          '</li>'
        );
      })
      .join('');

    panel.innerHTML =
      '<summary>Cuentas demo (dev · ' +
      escapeHtml(cfg.slug) +
      ')</summary>' +
      '<p class="kc-dev-login-hint__row">' +
      '<button type="button" class="kc-dev-login-hint__fill" data-email="' +
      escapeHtml(cfg.primary.email) +
      '">Rellenar</button> ' +
      '<code>' +
      escapeHtml(cfg.primary.email) +
      '</code> · contraseña <code>' +
      escapeHtml(DEV_PASSWORD) +
      '</code></p>' +
      (altItems ? '<ul class="kc-dev-login-hint__list">' + altItems + '</ul>' : '');

    if (anchor.classList && anchor.classList.contains('pf-v5-c-login__main')) {
      anchor.appendChild(panel);
    } else if (anchor.id === 'kc-form-login' || anchor.id === 'kc-form-buttons') {
      anchor.insertAdjacentElement('afterend', panel);
    } else {
      anchor.appendChild(panel);
    }

    panel.querySelectorAll('[data-email]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fillAccount(btn.getAttribute('data-email'));
      });
    });
  }

  function init() {
    const cfg = resolveAccountConfig();
    if (!cfg) {
      return;
    }
    fillAccount(cfg.primary.email);
    injectDevPanel(cfg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

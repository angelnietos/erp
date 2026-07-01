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

  const ALEXIS_ROLE_ACCOUNTS = [
    { email: 'admin@alexis.local', note: 'SuperAdmin', primary: true },
    { email: 'administrador@alexis.local', note: 'Administrador' },
    { email: 'responsable@alexis.local', note: 'Responsable' },
    { email: 'usuario@alexis.local', note: 'Usuario' },
    { email: 'tecnico.audio@alexis.local', note: 'Dani Sonido · técnico' },
    { email: 'tecnica.iluminacion@alexis.local', note: 'Laura Luces · técnico' },
    { email: 'freelance.video@alexis.local', note: 'Marta Video · freelance' },
  ];

  /** realm → clientId (opcional) → cuentas */
  const CONFIG = {
    'josanz-web-app-realm': {
      'josanz-web-app-spa': {
        slug: 'josanz',
        displayName: 'Generic ERP',
        accounts: [
          { email: 'admin@josanz.com', primary: true },
          { email: 'dani@josanz.com' },
          { email: 'alex@josanz.com' },
          { email: 'admin@josanz-erp.local', note: 'solo login local ERP' },
        ],
      },
      'josanz-figma-spa': {
        slug: 'alexis',
        displayName: 'Alexis',
        accounts: ALEXIS_ROLE_ACCOUNTS,
      },
      'verifactu-crm-spa': {
        slug: 'verifactu',
        displayName: 'Verifactu',
        password: 'Demo12345!',
        accounts: [{ email: 'admin@demo.local', primary: true }],
      },
      default: {
        slug: 'josanz',
        displayName: 'Generic ERP',
        accounts: [
          { email: 'admin@josanz.com', primary: true },
          { email: 'admin@alexis.local', note: 'tenant alexis' },
        ],
      },
    },
    'babooni-tenant': {
      default: {
        slug: 'babooni',
        displayName: 'Babooni',
        accounts: [
          { email: 'root@babooni.com', primary: true },
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
        displayName: 'Panel SaaS',
        accounts: [{ email: 'platform@babooni.com', primary: true }],
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

  function normalizeConfig(raw) {
    if (!raw) {
      return null;
    }
    if (raw.accounts && raw.accounts.length) {
      const primary = raw.accounts.find(function (a) {
        return a.primary;
      }) || raw.accounts[0];
      return {
        slug: raw.slug,
        displayName: raw.displayName || raw.slug,
        password: raw.password,
        primary: primary,
        alternates: raw.accounts.filter(function (a) {
          return a.email !== primary.email;
        }),
      };
    }
    return raw;
  }

  function resolveAccountConfig() {
    const realmCfg = CONFIG[getRealm()];
    if (!realmCfg) {
      return null;
    }
    const clientId = getClientId();
    return normalizeConfig(realmCfg[clientId] || realmCfg.default || null);
  }

  function isLogoutPage() {
    return window.location.pathname.indexOf('/protocol/openid-connect/logout') !== -1;
  }

  function isLoginFormPage() {
    if (isLogoutPage()) {
      return false;
    }
    if (document.documentElement.classList.contains('kc-logout-flow')) {
      return false;
    }
    return Boolean(
      document.getElementById('kc-form-login') ||
        document.getElementById('username') ||
        document.querySelector('input[name="username"]'),
    );
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
    const cfg = resolveAccountConfig();
    const password = cfg?.password || DEV_PASSWORD;
    setInputValue(findUsernameInput(), email);
    setInputValue(findPasswordInput(), password);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPanelHtml(cfg) {
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

    const primaryNote = cfg.primary.note
      ? ' <span class="kc-dev-login-hint__note">' + escapeHtml(cfg.primary.note) + '</span>'
      : '';
    const displayPassword = cfg.password || DEV_PASSWORD;

    return (
      '<summary>Cuentas demo (dev · ' +
      escapeHtml(cfg.displayName || cfg.slug) +
      ')</summary>' +
      '<p class="kc-dev-login-hint__row">' +
      '<button type="button" class="kc-dev-login-hint__fill" data-email="' +
      escapeHtml(cfg.primary.email) +
      '">Rellenar</button> ' +
      '<code>' +
      escapeHtml(cfg.primary.email) +
      '</code>' +
      primaryNote +
      ' · contraseña <code>' +
      escapeHtml(displayPassword) +
      '</code></p>' +
      (altItems ? '<ul class="kc-dev-login-hint__list">' + altItems + '</ul>' : '')
    );
  }

  function wirePanel(panel) {
    panel.querySelectorAll('[data-email]').forEach(function (btn) {
      if (btn.dataset.josanzWired === '1') {
        return;
      }
      btn.dataset.josanzWired = '1';
      btn.addEventListener('click', function () {
        fillAccount(btn.getAttribute('data-email'));
      });
    });
  }

  function injectDevPanel(cfg) {
    const existing = document.getElementById('kc-dev-login-hint');
    if (existing) {
      if (!existing.querySelector('.kc-dev-login-hint__row')) {
        existing.innerHTML = buildPanelHtml(cfg);
        wirePanel(existing);
      }
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
    panel.open = true;
    panel.innerHTML = buildPanelHtml(cfg);

    if (anchor.classList && anchor.classList.contains('pf-v5-c-login__main')) {
      anchor.appendChild(panel);
    } else if (anchor.id === 'kc-form-login' || anchor.id === 'kc-form-buttons') {
      anchor.insertAdjacentElement('afterend', panel);
    } else {
      anchor.appendChild(panel);
    }

    wirePanel(panel);
  }

  function removeDevPanel() {
    const panel = document.getElementById('kc-dev-login-hint');
    if (panel) {
      panel.remove();
    }
  }

  function init() {
    if (!isLoginFormPage()) {
      removeDevPanel();
      return;
    }

    const cfg = resolveAccountConfig();
    if (!cfg) {
      return;
    }
    fillAccount(cfg.primary.email);
    injectDevPanel(cfg);
  }

  function watchDom() {
    init();
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      init();
      if (attempts > 25) {
        window.clearInterval(timer);
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchDom);
  } else {
    watchDom();
  }
})();

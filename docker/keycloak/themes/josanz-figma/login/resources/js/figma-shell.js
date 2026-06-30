/**
 * Shell Figma Keycloak — logo, títulos, flujos login / reset / update-password / éxito.
 */
(function () {
  function pathKindFromLocation() {
    var path = window.location.pathname;
    if (path.indexOf('login-actions/required-action') !== -1) {
      return 'update-password';
    }
    if (path.indexOf('login-update-password') !== -1) {
      return 'update-password';
    }
    if (path.indexOf('reset-credentials') !== -1) {
      return 'reset-request';
    }
    return 'login';
  }

  function applyEarlyPageMode() {
    var kind = pathKindFromLocation();
    document.documentElement.classList.remove(
      'kc-reset-password-flow',
      'kc-update-password-flow',
      'kc-reset-success-flow',
    );
    document.documentElement.removeAttribute('data-kc-page');

    if (kind === 'reset-request') {
      document.documentElement.classList.add('kc-reset-password-flow');
      document.documentElement.setAttribute('data-kc-page', 'login-reset-password');
      document.title = 'Nueva contraseña · Josanz Audiovisual';
      return;
    }
    if (kind === 'update-password') {
      document.documentElement.classList.add('kc-update-password-flow');
      document.documentElement.setAttribute('data-kc-page', 'login-update-password');
      document.title = 'Nueva contraseña · Josanz Audiovisual';
      return;
    }
    document.title = 'Iniciar sesión · Josanz Audiovisual';
  }

  applyEarlyPageMode();

  function pageKind() {
    if (document.documentElement.classList.contains('kc-reset-success-flow')) {
      return 'reset-success';
    }
    return pathKindFromLocation();
  }

  function isResetCredentialsPage() {
    var kind = pageKind();
    return kind === 'reset-request' || kind === 'reset-success';
  }

  function isUpdatePasswordPage() {
    return pageKind() === 'update-password';
  }

  function isStandaloneApp() {
    var redirectUri = new URLSearchParams(window.location.search).get('redirect_uri') || '';
    try {
      return new URL(redirectUri).port === '4300';
    } catch (_err) {
      return redirectUri.indexOf(':4300') !== -1;
    }
  }

  function detectResetSuccess() {
    if (pathKindFromLocation() !== 'reset-request') {
      return false;
    }
    if (document.getElementById('kc-info-message')) {
      return true;
    }
    if (document.querySelector('.pf-v5-c-alert.pf-m-success')) {
      return true;
    }
    var form = document.getElementById('kc-reset-password-form') || document.getElementById('kc-form');
    var username = document.getElementById('username');
    return !form && !username;
  }

  function applyPageMode() {
    var isSuccess = detectResetSuccess();
    document.documentElement.classList.remove('kc-reset-success-flow');

    if (isSuccess) {
      document.documentElement.classList.add('kc-reset-success-flow');
      document.documentElement.setAttribute('data-kc-page', 'login-reset-password-success');
      document.title = 'Contraseña enviada · Josanz Audiovisual';
      return;
    }

    applyEarlyPageMode();
  }

  function applyLightShell() {
    var main = document.querySelector('.pf-v5-c-login__main');
    if (main) {
      main.classList.add('pf-v5-c-login__main--light', 'kc-theme-light');
    }
  }

  function hideOrgLinkIfNeeded() {
    if (!isResetCredentialsPage() && !isUpdatePasswordPage() && !isStandaloneApp()) {
      return;
    }
    var org = document.getElementById('kc-change-org-link');
    if (org) {
      org.style.display = 'none';
    }
  }

  function findMount() {
    return (
      document.querySelector('.pf-v5-c-login__header') ||
      document.querySelector('.pf-v5-c-login__main-body') ||
      document.querySelector('.pf-v5-c-login__main') ||
      document.querySelector('#kc-content') ||
      document.querySelector('.pf-v5-c-login__container')
    );
  }

  function copyForKind(kind) {
    if (kind === 'reset-success') {
      return {
        title: 'Nueva contraseña',
        subtitle: 'Contraseña enviada correctamente. Revisa tu bandeja de entrada.',
      };
    }
    if (kind === 'reset-request') {
      return {
        title: 'Nueva contraseña',
        subtitle: 'Te enviaremos un link para que crees una nueva contraseña.',
      };
    }
    if (kind === 'update-password') {
      return {
        title: 'Nueva contraseña',
        subtitle: 'Introduce y confirma tu nueva contraseña.',
      };
    }
    return { title: 'Iniciar sesión', subtitle: '' };
  }

  function ensureSuccessMessage(copy) {
    var existing = document.getElementById('kc-josanz-success');
    if (existing) {
      existing.textContent = copy.subtitle;
      return;
    }
    var mount =
      document.querySelector('.pf-v5-c-login__main-body') ||
      document.querySelector('.pf-v5-c-login__main') ||
      findMount();
    if (!mount) {
      return;
    }
    var node = document.createElement('p');
    node.id = 'kc-josanz-success';
    node.className = 'kc-josanz-success';
    node.setAttribute('role', 'status');
    node.textContent = copy.subtitle;
    mount.appendChild(node);
  }

  function ensureBrandChrome() {
    var mount = findMount();
    if (!mount) {
      return false;
    }

    var kind = pageKind();
    var copy = copyForKind(kind);

    var brand = document.getElementById('kc-josanz-brand');
    if (!brand) {
      brand = document.createElement('div');
      brand.id = 'kc-josanz-brand';
      brand.className = 'kc-josanz-brand';

      var logo = document.createElement('div');
      logo.className = 'kc-josanz-logo';
      logo.setAttribute('role', 'img');
      logo.setAttribute('aria-label', 'Josanz Audiovisual');
      brand.appendChild(logo);

      var heading = document.createElement('h1');
      heading.className = 'kc-josanz-heading';
      heading.id = 'kc-josanz-heading';
      brand.appendChild(heading);

      var subtitle = document.createElement('p');
      subtitle.className = 'kc-josanz-subtitle';
      subtitle.id = 'kc-josanz-subtitle';
      brand.appendChild(subtitle);

      var header = document.querySelector('.pf-v5-c-login__header');
      if (header) {
        header.insertBefore(brand, header.firstChild);
      } else {
        mount.insertBefore(brand, mount.firstChild);
      }
    }

    var headingEl = document.getElementById('kc-josanz-heading');
    var subtitleEl = document.getElementById('kc-josanz-subtitle');
    if (headingEl) {
      headingEl.textContent = copy.title;
    }
    if (subtitleEl) {
      if (kind === 'reset-success') {
        subtitleEl.style.display = 'none';
      } else {
        subtitleEl.textContent = copy.subtitle;
        subtitleEl.style.display = copy.subtitle ? 'block' : 'none';
      }
    }

    if (kind === 'reset-success') {
      ensureSuccessMessage(copy);
    }

    var pageTitle = document.getElementById('kc-page-title');
    if (pageTitle) {
      pageTitle.setAttribute('aria-hidden', 'true');
      pageTitle.style.display = 'none';
    }

    document.querySelectorAll('.instruction').forEach(function (node) {
      node.style.display = 'none';
    });

    var headerMount = document.querySelector('.pf-v5-c-login__header');
    if (headerMount) {
      headerMount.classList.add('kc-josanz-header-ready');
    } else {
      mount.classList.add('kc-josanz-main-ready');
    }

    document.body.classList.add('kc-josanz-ready');
    return true;
  }

  function boot() {
    applyPageMode();
    applyLightShell();
    hideOrgLinkIfNeeded();
    ensureBrandChrome();
  }

  function watchDom() {
    boot();
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      boot();
      if (document.getElementById('kc-josanz-brand') || attempts > 40) {
        window.clearInterval(timer);
      }
    }, 100);

    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function () {
        boot();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.setTimeout(function () {
        observer.disconnect();
      }, 8000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchDom);
  } else {
    watchDom();
  }
})();

/**
 * Shell Figma Keycloak — logo, títulos, flujos login / reset / update-password / éxito.
 * Sin MutationObserver (provocaba bucle infinito de mutaciones DOM).
 */
(function () {
  var lastAppliedKind = '';
  var brandMounted = false;

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
      return kind;
    }
    if (kind === 'update-password') {
      document.documentElement.classList.add('kc-update-password-flow');
      document.documentElement.setAttribute('data-kc-page', 'login-update-password');
      document.title = 'Nueva contraseña · Josanz Audiovisual';
      return kind;
    }
    document.title = 'Iniciar sesión · Josanz Audiovisual';
    return kind;
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
    return false;
  }

  function applyPageMode() {
    var isSuccess = detectResetSuccess();
    var kind;

    if (isSuccess) {
      kind = 'reset-success';
      if (lastAppliedKind !== kind) {
        document.documentElement.classList.remove(
          'kc-reset-password-flow',
          'kc-update-password-flow',
        );
        document.documentElement.classList.add('kc-reset-success-flow');
        document.documentElement.setAttribute('data-kc-page', 'login-reset-password-success');
        document.title = 'Contraseña enviada · Josanz Audiovisual';
      }
      lastAppliedKind = kind;
      return kind;
    }

    document.documentElement.classList.remove('kc-reset-success-flow');
    kind = applyEarlyPageMode();
    lastAppliedKind = kind;
    return kind;
  }

  function applyLightShell() {
    var main = document.querySelector('.pf-v5-c-login__main');
    if (!main || main.classList.contains('pf-v5-c-login__main--light')) {
      return;
    }
    main.classList.add('pf-v5-c-login__main--light', 'kc-theme-light');
  }

  function hideOrgLinkIfNeeded() {
    if (!isResetCredentialsPage() && !isUpdatePasswordPage() && !isStandaloneApp()) {
      return;
    }
    var org = document.getElementById('kc-change-org-link');
    if (org && org.style.display !== 'none') {
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
      if (existing.textContent !== copy.subtitle) {
        existing.textContent = copy.subtitle;
      }
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

    var kind = applyPageMode();
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
      brandMounted = true;
    }

    var headingEl = document.getElementById('kc-josanz-heading');
    var subtitleEl = document.getElementById('kc-josanz-subtitle');
    if (headingEl && headingEl.textContent !== copy.title) {
      headingEl.textContent = copy.title;
    }
    if (subtitleEl) {
      if (kind === 'reset-success') {
        subtitleEl.style.display = 'none';
      } else {
        if (subtitleEl.textContent !== copy.subtitle) {
          subtitleEl.textContent = copy.subtitle;
        }
        subtitleEl.style.display = copy.subtitle ? 'block' : 'none';
      }
    }

    if (kind === 'reset-success') {
      ensureSuccessMessage(copy);
    }

    var pageTitle = document.getElementById('kc-page-title');
    if (pageTitle && pageTitle.style.display !== 'none') {
      pageTitle.setAttribute('aria-hidden', 'true');
      pageTitle.style.display = 'none';
    }

    if (!document.body.classList.contains('kc-josanz-ready')) {
      document.body.classList.add('kc-josanz-ready');
    }

    return true;
  }

  function boot() {
    applyLightShell();
    hideOrgLinkIfNeeded();
    ensureBrandChrome();
  }

  function watchDom() {
    boot();
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (!brandMounted || attempts < 5) {
        boot();
      }
      if (brandMounted || attempts > 25) {
        window.clearInterval(timer);
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchDom, { once: true });
  } else {
    watchDom();
  }
})();

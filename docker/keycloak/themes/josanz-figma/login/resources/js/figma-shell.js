/**
 * Shell Figma Keycloak — login / reset / update-password / éxito + feedback.
 */
(function () {
  var lastAppliedKind = '';
  var brandMounted = false;

  var COPY = {
    es: {
      loginTitle: 'Iniciar sesión',
      resetTitle: 'Nueva contraseña',
      resetSubtitle: 'Te enviaremos un link para que crees una nueva contraseña.',
      resetSuccess: 'Contraseña enviada correctamente. Revisa tu bandeja de entrada.',
      updateSubtitle: 'Introduce y confirma tu nueva contraseña.',
      submitting: 'Enviando…',
      submitReset: 'Enviar link de recuperación',
      backLogin: '← Volver al inicio de sesión',
      mailhogHint: 'Dev: revisa el email en MailHog (localhost:8025).',
    },
    en: {
      loginTitle: 'Sign in',
      resetTitle: 'New password',
      resetSubtitle: 'We will send you a link to create a new password.',
      resetSuccess: 'Password sent successfully. Check your inbox.',
      updateSubtitle: 'Enter and confirm your new password.',
      submitting: 'Sending…',
      submitReset: 'Send recovery link',
      backLogin: '← Back to sign in',
      mailhogHint: 'Dev: check the email in MailHog (localhost:8025).',
    },
  };

  function currentLocale() {
    var lang = (document.documentElement.lang || 'es').toLowerCase();
    if (lang.indexOf('en') === 0) {
      return 'en';
    }
    return 'es';
  }

  function t(key) {
    var locale = currentLocale();
    return (COPY[locale] && COPY[locale][key]) || COPY.es[key] || '';
  }

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
      document.title = t('resetTitle') + ' · Josanz Audiovisual';
      return kind;
    }
    if (kind === 'update-password') {
      document.documentElement.classList.add('kc-update-password-flow');
      document.documentElement.setAttribute('data-kc-page', 'login-update-password');
      document.title = t('resetTitle') + ' · Josanz Audiovisual';
      return kind;
    }
    document.title = t('loginTitle') + ' · Josanz Audiovisual';
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

  function isLocalDev() {
    return (
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );
  }

  function nodeText(node) {
    return node ? (node.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function detectResetSuccess() {
    if (pathKindFromLocation() !== 'reset-request') {
      return false;
    }

    var info = document.getElementById('kc-info-message');
    if (info && nodeText(info).length > 4) {
      return true;
    }

    var success = document.querySelector('.pf-v5-c-alert.pf-m-success');
    if (success && nodeText(success).length > 4) {
      return true;
    }

    var form =
      document.getElementById('kc-reset-password-form') ||
      document.getElementById('kc-form');
    var username = document.getElementById('username');
    if (!form && !username && (info || success)) {
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
        document.title = t('resetSuccess') + ' · Josanz Audiovisual';
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

  function hideDuplicateInstructions() {
    document.querySelectorAll('.instruction').forEach(function (node) {
      if (node.style.display !== 'none') {
        node.style.display = 'none';
      }
    });
    document
      .querySelectorAll('#kc-form-wrapper + .instruction, .pf-v5-c-login__main-footer .instruction')
      .forEach(function (node) {
        node.style.display = 'none';
      });
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
      return { title: t('resetTitle'), subtitle: t('resetSuccess') };
    }
    if (kind === 'reset-request') {
      return { title: t('resetTitle'), subtitle: t('resetSubtitle') };
    }
    if (kind === 'update-password') {
      return { title: t('resetTitle'), subtitle: t('updateSubtitle') };
    }
    return { title: t('loginTitle'), subtitle: '' };
  }

  function buildBackToLoginHref() {
    var params = new URLSearchParams(window.location.search);
    var clientId = params.get('client_id');
    var redirectUri = params.get('redirect_uri');
    var path = window.location.pathname.replace(/\/login-actions\/.*$/, '');
    var loginUrl = path + '/protocol/openid-connect/auth';
    var next = new URLSearchParams();
    if (clientId) {
      next.set('client_id', clientId);
    }
    if (redirectUri) {
      next.set('redirect_uri', redirectUri);
    }
    next.set('response_type', params.get('response_type') || 'code');
    var scope = params.get('scope');
    if (scope) {
      next.set('scope', scope);
    }
  var state = params.get('state');
    if (state) {
      next.set('state', state);
    }
    var codeChallenge = params.get('code_challenge');
    if (codeChallenge) {
      next.set('code_challenge', codeChallenge);
      next.set('code_challenge_method', params.get('code_challenge_method') || 'S256');
    }
    return loginUrl + '?' + next.toString();
  }

  function ensureSuccessPanel(copy) {
    var panel = document.getElementById('kc-josanz-success-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'kc-josanz-success-panel';
      panel.className = 'kc-josanz-success-panel';
      panel.setAttribute('role', 'status');

      var icon = document.createElement('div');
      icon.className = 'kc-josanz-success-panel__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '✓';
      panel.appendChild(icon);

      var message = document.createElement('p');
      message.className = 'kc-josanz-success-panel__message';
      message.id = 'kc-josanz-success-message';
      panel.appendChild(message);

      var back = document.createElement('a');
      back.className = 'kc-josanz-success-panel__back';
      back.id = 'kc-josanz-success-back';
      back.href = buildBackToLoginHref();
      panel.appendChild(back);

      if (isLocalDev()) {
        var dev = document.createElement('p');
        dev.className = 'kc-josanz-success-panel__dev';
        dev.id = 'kc-josanz-success-dev';
        panel.appendChild(dev);
      }

      var mount =
        document.querySelector('.pf-v5-c-login__main-body') ||
        document.querySelector('.pf-v5-c-login__main') ||
        findMount();
      if (mount) {
        mount.appendChild(panel);
      }
    }

    var messageEl = document.getElementById('kc-josanz-success-message');
    if (messageEl) {
      messageEl.textContent = copy.subtitle;
    }
    var backEl = document.getElementById('kc-josanz-success-back');
    if (backEl) {
      backEl.textContent = t('backLogin');
      backEl.href = buildBackToLoginHref();
    }
    var devEl = document.getElementById('kc-josanz-success-dev');
    if (devEl) {
      devEl.textContent = t('mailhogHint');
    }
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
      ensureSuccessPanel(copy);
    }

    var pageTitle = document.getElementById('kc-page-title');
    if (pageTitle && pageTitle.style.display !== 'none') {
      pageTitle.setAttribute('aria-hidden', 'true');
      pageTitle.style.display = 'none';
    }

    hideDuplicateInstructions();

    if (!document.body.classList.contains('kc-josanz-ready')) {
      document.body.classList.add('kc-josanz-ready');
    }

    return true;
  }

  function wireResetFormFeedback() {
    var form =
      document.getElementById('kc-reset-password-form') || document.getElementById('kc-form');
    if (!form || form.dataset.josanzWired === '1') {
      return;
    }
    form.dataset.josanzWired = '1';

    form.addEventListener('submit', function () {
      document.body.classList.add('kc-josanz-submitting');
      var btn = form.querySelector(
        '#kc-form-buttons input[type="submit"], #kc-form-buttons button[type="submit"], input[type="submit"], button[type="submit"]',
      );
      if (!btn) {
        return;
      }
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if (btn.tagName === 'INPUT') {
        btn.value = t('submitting');
      } else {
        btn.textContent = t('submitting');
      }
    });
  }

  function boot() {
    applyLightShell();
    hideOrgLinkIfNeeded();
    ensureBrandChrome();
    wireResetFormFeedback();
  }

  function watchDom() {
    boot();
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      boot();
      if ((brandMounted && document.getElementById('kc-reset-password-form')) || attempts > 25) {
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

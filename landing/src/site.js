// Amélioration progressive : sans JavaScript, la page et le formulaire fonctionnent
// (envoi natif vers Brevo). Ce script ajoute l'envoi sans rechargement et
// pré-coche le rôle quand on arrive au formulaire depuis une carte « Pour qui ».
(() => {
  const form = document.querySelector('[data-th-form]');

  document.querySelectorAll('[data-th-role]').forEach((link) => {
    link.addEventListener('click', () => {
      const box = form && form.querySelector(`input[data-role="${link.dataset.thRole}"]`);
      if (box) box.checked = true;
    });
  });

  if (!form || !window.fetch || !window.FormData) return;

  const status = form.querySelector('[data-th-status]');
  const button = form.querySelector('button[type="submit"]');
  const say = (message, kind) => {
    status.textContent = message;
    status.dataset.kind = kind || '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    say(form.dataset.msgSending);
    const url = form.action + (form.action.includes('?') ? '&' : '?') + 'isAjax=1';
    let response;
    try {
      response = await fetch(url, { method: 'POST', body: new FormData(form) });
    } catch {
      // Réseau ou CORS : on retombe sur l'envoi natif, qui mène à la confirmation Brevo.
      form.submit();
      return;
    }
    const data = await response.json().catch(() => ({}));
    button.disabled = false;
    if (response.ok && data.success !== false) {
      form.reset();
      say(form.dataset.msgThanks, 'ok');
    } else {
      say(form.dataset.msgError, 'error');
    }
  });
})();

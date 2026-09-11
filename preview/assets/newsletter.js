(() => {
  const stage = document.getElementById('planet-stage');
  let planetReady;
  const loadPlanet = () => planetReady ||= import('./planet.js?v=4').then(module => module.mountPlanet(stage));
  const celebrate = () => {
    if (stage) loadPlanet().then(() => stage.dispatchEvent(new Event('planet-celebrate'))).catch(() => {});
  };
  if (stage) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadPlanet().catch(() => {});
    }, { rootMargin: '150px' });
    observer.observe(stage);
  }
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  const email = document.getElementById('newsletter-email');
  const error = document.getElementById('signup-error');
  form.querySelector('button[type=submit]').disabled = false;

  form.addEventListener('submit', event => {
    email.value = email.value.trim();
    error.hidden = true;
    email.removeAttribute('aria-invalid');
    if (!email.value || !email.checkValidity()) {
      event.preventDefault();
      email.setAttribute('aria-invalid', 'true');
      error.textContent = 'Please enter a valid email address.';
      error.hidden = false;
      email.focus();
      return;
    }
    // React to valid input; this animation does not confirm that a subscription was saved.
    celebrate();
    // A mailing-list provider must be connected before this page accepts signups.
    // Never claim an address was saved when there is no submission destination.
    if (!form.hasAttribute('action')) {
      event.preventDefault();
      error.textContent = 'Signup is not available just yet. Please try again soon.';
      error.hidden = false;
    }
  });
  email.addEventListener('input', () => {
    error.hidden = true;
    email.removeAttribute('aria-invalid');
  });
})();

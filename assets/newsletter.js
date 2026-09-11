(() => {
  const stage = document.getElementById('planet-stage');
  if (stage) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      import('./planet.js?v=3').then(module => module.mountPlanet(stage)).catch(() => {});
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

(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const setupChip = () => {
    const stage = document.getElementById('chip-stage');
    if (!stage || stage.dataset.initialized) return;
    stage.dataset.initialized = 'true';
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      import('./zeus-chip.js?v=4').then(module => module.mountChip(stage)).catch(() => {
        stage.classList.add('chip-unavailable');
      });
    }, { rootMargin: '250px' });
    observer.observe(stage);
  };
  setupChip();
  document.addEventListener('shopify:section:load', setupChip);
})();

(() => {
  function setupPlanet() {
    const stage = document.getElementById('planet-stage');
    if (!stage || stage.dataset.initialized) return;
    stage.dataset.initialized = 'true';
    const controller = new AbortController();
    let cleanupPlanet;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      import('./planet.js').then(async module => {
        cleanupPlanet = await module.mountPlanet(stage);
        if (!stage.isConnected) cleanupPlanet?.();
      }).catch(() => {});
    }, { rootMargin: '150px' });
    observer.observe(stage);
    document.addEventListener('shopify:section:unload', event => {
      if (!event.target.contains(stage)) return;
      controller.abort();
      observer.disconnect();
      cleanupPlanet?.();
    }, { signal: controller.signal });
  }
  setupPlanet();
  document.addEventListener('shopify:section:load', setupPlanet);
})();

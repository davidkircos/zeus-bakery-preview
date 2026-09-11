import * as THREE from './three.module.min.js';

export async function mountPlanet(stage) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  let texture;
  try {
    texture = await new THREE.TextureLoader().loadAsync(new URL('./earth-map.jpg', import.meta.url).href);
  } catch { renderer.dispose(); return; }
  if (!stage.isConnected) { texture.dispose(); renderer.dispose(); return; }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 20);
  camera.position.set(0, 1.6, 4);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xc5dafa, 2));
  const sunlight = new THREE.DirectionalLight(0xfff4df, 2.5);
  sunlight.position.set(-3, 3, 4); scene.add(sunlight);
  const fill = new THREE.DirectionalLight(0x8cc5ff, .55);
  fill.position.set(3, -1, -2); scene.add(fill);
  const globe = new THREE.Group(); globe.rotation.z = -.23; scene.add(globe);
  const geometry = new THREE.SphereGeometry(1, 72, 48);
  const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 8, specular: 0x203957, emissive: 0x102846, emissiveIntensity: .4 });
  const earth = new THREE.Mesh(geometry, material); globe.add(earth);
  // Each full turn returns to North America with the East Coast near the center.
  earth.rotation.y = -.25;
  const haloGeometry = new THREE.SphereGeometry(1.025, 64, 40);
  const haloMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide,
    vertexShader: 'varying vec3 n; varying vec3 p; void main(){vec4 v=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);p=v.xyz;gl_Position=projectionMatrix*v;}',
    fragmentShader: 'varying vec3 n; varying vec3 p; void main(){float rim=pow(1.0-abs(dot(normalize(n),normalize(-p))),2.0);gl_FragColor=vec4(0.17,0.49,0.88,rim*0.3);}'
  });
  globe.add(new THREE.Mesh(haloGeometry, haloMaterial));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.appendChild(renderer.domElement); stage.classList.add('planet-ready');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, raf = 0, previous = 0, happyRemaining = 0, happyTimer = 0;
  let angle = earth.rotation.y, target = angle, lastScroll = window.scrollY;
  let spinRemaining = reduced.matches ? 0 : Math.PI * 2;
  function draw() { renderer.render(scene, camera); }
  function stop() { cancelAnimationFrame(raf); raf = 0; previous = 0; }
  function tick(now) {
    raf = 0;
    if (!stage.isConnected) { cleanup(); return; }
    if (!visible || document.hidden) return;
    const dt = Math.min((now - (previous || now)) / 1000, .05); previous = now;
    if (!reduced.matches && spinRemaining > 0) {
      const step = Math.min(spinRemaining, dt * Math.max(.5, spinRemaining * 2.2));
      angle += step; target += step; spinRemaining -= step;
    }
    if (happyRemaining > 0 && !reduced.matches) {
      happyRemaining = Math.max(0, happyRemaining - dt);
      const progress = 1 - happyRemaining / 2.6;
      globe.position.y = Math.abs(Math.sin(progress * Math.PI * 3)) * .08 * (1 - progress);
      globe.rotation.z = -.23 + Math.sin(progress * Math.PI * 4) * .06 * (1 - progress);
      if (!happyRemaining) stage.classList.remove('planet-happy');
    }
    angle += (target - angle) * (1 - Math.exp(-dt * 5));
    earth.rotation.y = angle; draw();
    if (!reduced.matches && (happyRemaining > 0 || spinRemaining > 0 || Math.abs(target - angle) > .0005)) raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && visible && !document.hidden) { previous = 0; raf = requestAnimationFrame(tick); } }
  function onScroll() {
    const current = window.scrollY;
    if (visible && !reduced.matches) target += Math.max(-.5, Math.min(.5, (current - lastScroll) * .0025));
    lastScroll = current; start();
  }
  function onSpin() {
    if (reduced.matches) {
      // Offer a new view without a motion effect when reduced motion is preferred.
      angle += Math.PI / 6; target = angle; earth.rotation.y = angle; draw();
      return;
    }
    // A full turn that slows to a stop; cap rapid clicks at two queued turns.
    spinRemaining = Math.min(spinRemaining + Math.PI * 2, Math.PI * 4);
    start();
  }
  function onCelebrate() {
    clearTimeout(happyTimer); stage.classList.add('planet-happy');
    if (reduced.matches) happyTimer = setTimeout(() => stage.classList.remove('planet-happy'), 2600);
    else happyRemaining = 2.6;
    onSpin();
  }
  function onMotion() {
    spinRemaining = 0; happyRemaining = 0; target = angle;
    clearTimeout(happyTimer); stage.classList.remove('planet-happy');
    globe.position.y = 0; globe.rotation.z = -.23; stop(); draw();
  }
  function onVisibility() { if (document.hidden) stop(); else start(); }
  const resize = new ResizeObserver(() => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height;
    camera.position.z = 4 / Math.min(camera.aspect, 1); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); draw();
  });
  resize.observe(stage);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else stop(); });
  observer.observe(stage);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', onMotion);
  stage.addEventListener('click', onSpin); stage.disabled = false;
  stage.addEventListener('planet-celebrate', onCelebrate);
  function cleanup() {
    stop(); resize.disconnect(); observer.disconnect();
    window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotion);
    stage.removeEventListener('click', onSpin); stage.disabled = true;
    stage.removeEventListener('planet-celebrate', onCelebrate); clearTimeout(happyTimer);
    geometry.dispose(); material.dispose(); haloGeometry.dispose(); haloMaterial.dispose(); texture.dispose(); renderer.dispose();
  }
}

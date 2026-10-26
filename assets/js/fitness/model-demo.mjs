const loadViewerLibraries = () => Promise.all([
  import('../vendor/three-0.170.0/three.module.mjs'),
  import('../vendor/three-0.170.0/GLTFLoader.mjs'),
]);

/** Lazy, self-hosted viewer. Route disposal cancels fetches and releases GPU resources. */
export function mountModelDemo(figure, loadLibraries = loadViewerLibraries) {
  const host = figure.querySelector('[data-demo-model]');
  if (!host) return () => {};
  const play = figure.querySelector('[data-model-play]');
  const speed = figure.querySelector('[data-model-speed]');
  const reset = figure.querySelector('[data-model-reset]');
  const abort = new AbortController();
  const cleanups = [];
  const resources = new Set();
  let disposed = false;
  let playing = false;
  let animationFrame;
  let mixer;
  let modelScene;

  function pause() {
    playing = false;
    cancelAnimationFrame(animationFrame);
    play.textContent = 'Play animation';
    play.setAttribute('aria-pressed', 'false');
  }
  function disposeResources() {
    resources.forEach(resource => resource.dispose());
    resources.clear();
  }
  function release() {
    pause();
    abort.abort();
    cleanups.splice(0).reverse().forEach(cleanup => cleanup());
    if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(modelScene); }
    disposeResources();
  }
  function fail() {
    release();
    play.disabled = true;
    play.textContent = 'Animation unavailable';
    reset.disabled = true;
    speed.disabled = true;
    figure.querySelector('[data-media-error]').hidden = false;
    const pictures = figure.querySelector('.fit-picture-guide');
    if (pictures) pictures.open = true;
  }
  function listen(target, event, handler) {
    target.addEventListener(event, handler);
    cleanups.push(() => target.removeEventListener(event, handler));
  }

  loadLibraries().then(async ([T, { GLTFLoader }]) => {
    if (disposed) return;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    cleanups.push(() => { renderer.dispose(); renderer.domElement.remove(); });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0xecece8, 1);
    host.append(renderer.domElement);
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xffffff, 0x505050, 2.5));
    const light = new T.DirectionalLight(0xffffff, 3);
    light.position.set(3, 5, 3);
    scene.add(light);
    const camera = new T.PerspectiveCamera(40, 1, 0.01, 100);
    let angle = Math.PI / 2;
    let elevation = .8;
    let last = 0;
    const aim = () => {
      camera.position.set(Math.sin(angle) * 2.8, elevation, Math.cos(angle) * 2.8);
      camera.lookAt(0, .3, -.1);
    };
    const draw = () => { if (!disposed && host.clientWidth && host.clientHeight) renderer.render(scene, camera); };
    const resize = () => {
      if (disposed || !host.clientWidth || !host.clientHeight) return;
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      aim();
      draw();
    };
    const observer = new ResizeObserver(resize);
    cleanups.push(() => observer.disconnect());
    observer.observe(host);
    const tick = time => {
      if (!playing || disposed) return;
      mixer.update(Math.min((time - last) / 1000, .1) * (speed.value === '0.5' ? .5 : 1));
      last = time;
      draw();
      animationFrame = requestAnimationFrame(tick);
    };
    listen(play, 'click', () => {
      if (playing) pause();
      else if (mixer) {
        playing = true;
        last = performance.now();
        play.textContent = 'Pause animation';
        play.setAttribute('aria-pressed', 'true');
        animationFrame = requestAnimationFrame(tick);
      }
    });
    listen(document, 'visibilitychange', () => { if (document.hidden) pause(); });
    listen(renderer.domElement, 'webglcontextlost', fail);
    listen(reset, 'click', () => { angle = Math.PI / 2; elevation = .8; aim(); draw(); });
    let drag;
    listen(host, 'pointerdown', event => {
      if (event.button !== 0) return;
      drag = [event.clientX, event.clientY];
      host.setPointerCapture(event.pointerId);
    });
    listen(host, 'pointermove', event => {
      if (!drag) return;
      angle -= (event.clientX - drag[0]) * .01;
      elevation = Math.max(.4, Math.min(2.5, elevation + (event.clientY - drag[1]) * .01));
      drag = [event.clientX, event.clientY];
      aim();
      draw();
    });
    listen(host, 'pointerup', () => { drag = null; });
    listen(host, 'pointercancel', () => { drag = null; });
    listen(host, 'keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      angle += event.key === 'ArrowLeft' ? .2 : -.2;
      aim();
      draw();
    });
    resize();
    // Models in the approved catalog are self-contained GLBs with embedded buffers.
    const response = await fetch(host.dataset.modelSrc, { signal: abort.signal });
    if (!response.ok) throw new Error('Animation asset is unavailable.');
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
    gltf.scene.traverse(object => {
      if (object.geometry) resources.add(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of materials) {
        resources.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      }
    });
    if (disposed || abort.signal.aborted) { disposeResources(); return; }
    scene.add(gltf.scene);
    modelScene = gltf.scene;
    mixer = new T.AnimationMixer(modelScene);
    for (const clip of gltf.animations) mixer.clipAction(clip).play();
    mixer.update(0);
    draw();
    play.disabled = false;
    play.textContent = 'Play animation';
    play.setAttribute('aria-pressed', 'false');
  }).catch(() => { if (!disposed) fail(); });
  return () => { if (!disposed) { disposed = true; release(); } };
}

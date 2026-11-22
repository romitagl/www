/** GIF playback is opt-in, stops on tab changes, and never drives workout timers.
 * Browsers cannot pause a GIF at an arbitrary frame, so Stop restores a still.
 */
export function mountGifDemo(figure) {
  const image = figure.querySelector('[data-gif-image]');
  const button = figure.querySelector('[data-gif-play]');
  const status = figure.querySelector('[data-gif-status]');
  if (!image || !button || !status) return () => {};
  const previous = figure.querySelector('[data-gif-previous]');
  const next = figure.querySelector('[data-gif-next]');
  const stepNote = figure.querySelector('[data-gif-step-note]');
  let stills = [];
  try { stills = JSON.parse(image.dataset.gifStills || '[]'); } catch { /* Optional enhancement. */ }
  let step = 0;
  function syncSteps() {
    if (!stills.length || !previous || !next || !stepNote) return;
    previous.disabled = running || step === 0;
    next.disabled = running || step === stills.length - 1;
    stepNote.hidden = running;
    stepNote.textContent = stills[step].text;
  }
  let running = false;
  let timeout;
  let failed = false;
  const loop = image.dataset.gifLoop === 'true';
  const idleText = loop ? 'Play animated guide' : 'Play setup guide';

  function stop({ complete = false } = {}) {
    clearTimeout(timeout);
    timeout = undefined;
    running = false;
    image.src = complete ? image.dataset.gifEndPoster : image.dataset.gifPoster;
    image.alt = complete ? image.dataset.gifEndAlt : image.dataset.gifPosterAlt;
    step = complete ? Math.max(0, stills.length - 1) : 0;
    syncSteps();
    button.textContent = complete ? 'Replay setup guide' : idleText;
    button.setAttribute('aria-pressed', 'false');
    status.textContent = complete
      ? 'Setup guide complete. Stay still for the prescribed hold; follow the written cues.'
      : 'Stopped. Select Play to start the illustrated sequence.';
  }
  function play() {
    if (failed || document.hidden) return;
    running = true;
    syncSteps();
    image.alt = image.dataset.gifAlt;
    image.src = image.dataset.gifSrc;
    button.textContent = 'Stop animation';
    button.setAttribute('aria-pressed', 'true');
    status.textContent = loop ? 'Playing the illustrated positions in a loop.' : 'Playing the setup and sides once. This is a static hold.';
  }
  function click() { if (running) stop(); else play(); }
  function loaded() {
    if (!running || loop) return;
    // Count the finite sequence from load, not from the click/network request.
    clearTimeout(timeout);
    timeout = setTimeout(() => { stop({ complete: true }); }, Number(image.dataset.gifDuration));
  }
  function error() {
    if (!running) return;
    failed = true;
    stop();
    button.disabled = true;
    button.textContent = 'Animation unavailable';
    status.textContent = 'The animation could not load. Use the picture guide below.';
    const pictures = figure.querySelector('.fit-picture-guide');
    if (pictures) pictures.open = true;
  }
  function showStep(delta) {
    if (running || !stills.length) return;
    step = Math.max(0, Math.min(stills.length - 1, step + delta));
    image.src = stills[step].src;
    image.alt = stills[step].alt;
    status.textContent = `Still pose ${step + 1} of ${stills.length}. Take your time to read the cues.`;
    syncSteps();
  }
  const onPrevious = () => showStep(-1);
  const onNext = () => showStep(1);
  previous?.addEventListener('click', onPrevious);
  next?.addEventListener('click', onNext);
  syncSteps();
  const visibility = () => { if (document.hidden && running) stop(); };
  button.addEventListener('click', click);
  image.addEventListener('load', loaded);
  image.addEventListener('error', error);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    clearTimeout(timeout);
    if (running) stop();
    button.removeEventListener('click', click);
    previous?.removeEventListener('click', onPrevious);
    next?.removeEventListener('click', onNext);
    image.removeEventListener('load', loaded);
    image.removeEventListener('error', error);
    document.removeEventListener('visibilitychange', visibility);
  };
}

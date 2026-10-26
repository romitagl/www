import { mountModelDemo } from './model-demo.mjs';
/** Native video lifecycle is independent of workout timers and scoring. */
export function mountDemo(container) {
  const figure = container.querySelector('[data-demo]');
  if (!figure) return () => {};
  const images = [...figure.querySelectorAll('img')];
  const showError = () => {
    figure.querySelector('[data-media-error]').hidden = false;
    const pictures = figure.querySelector('.fit-picture-guide');
    if (pictures) pictures.open = true;
  };
  for (const image of images) {
    image.addEventListener('error', showError);
    if (image.complete && image.naturalWidth === 0) showError();
  }
  const video = figure.querySelector('[data-demo-video]');
  const disposeModel = mountModelDemo(figure);
  const speed = figure.querySelector('[data-video-speed]');
  const pause = () => video?.pause();
  const onVisibility = () => { if (document.hidden) pause(); };
  const onSpeed = () => { if (video) video.playbackRate = speed.value === '0.5' ? 0.5 : 1; };
  video?.addEventListener('error', showError);
  speed?.addEventListener('change', onSpeed);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    disposeModel();
    pause();
    images.forEach(image => image.removeEventListener('error', showError));
    video?.removeEventListener('error', showError);
    speed?.removeEventListener('change', onSpeed);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

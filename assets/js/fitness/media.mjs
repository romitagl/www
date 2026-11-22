import { mountModelDemo } from './model-demo.mjs';
import { mountGifDemo } from './gif-demo.mjs';
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
  const disposeGif = mountGifDemo(figure);
  // Optional 3D assets are fetched only when their disclosure is opened.
  const modelDetails = figure.querySelector('[data-model-details]');
  let disposeModel = () => {};
  let modelMounted = false;
  const loadModel = () => {
    if (modelDetails && !modelDetails.open) {
      if (modelMounted) { disposeModel(); modelMounted = false; }
      return;
    }
    if (modelMounted) return;
    modelMounted = true;
    disposeModel = mountModelDemo(figure);
  };
  loadModel();
  modelDetails?.addEventListener('toggle', loadModel);
  const speed = figure.querySelector('[data-video-speed]');
  const pause = () => video?.pause();
  const onVisibility = () => { if (document.hidden) pause(); };
  const onSpeed = () => { if (video) video.playbackRate = speed.value === '0.5' ? 0.5 : 1; };
  video?.addEventListener('error', showError);
  speed?.addEventListener('change', onSpeed);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    disposeGif();
    disposeModel();
    modelDetails?.removeEventListener('toggle', loadModel);
    pause();
    images.forEach(image => image.removeEventListener('error', showError));
    video?.removeEventListener('error', showError);
    speed?.removeEventListener('change', onSpeed);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

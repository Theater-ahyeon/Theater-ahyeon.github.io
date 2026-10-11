import {watchImage} from './assets.js?v=21.9-public6';

/** Non-blocking image presentation. Layout and source links remain available. */
export function monitorImage(image, {onReady, onError} = {}) {
  if (!image) return () => {};
  const stage = image.parentElement;
  if (!stage) return () => {};
  stage.classList.add('asset-stage');
  const imageLabel=stage.getAttribute('role')==='img'?stage.getAttribute('aria-label'):null;
  const setState = state => {
    if (!image.isConnected || image.parentElement !== stage) return;
    stage.dataset.imageState = state;
    image.dataset.imageState = state;
    let status = stage.querySelector(':scope > .asset-status');
    if (state === 'ready') {
      if(imageLabel)stage.setAttribute('aria-label',imageLabel);
      status?.remove();
      return;
    }
    if (!status) {
      status = document.createElement('span');
      status.className = 'asset-status';
      status.setAttribute('role', 'status');
      stage.append(status);
    }
    const bridge = stage.querySelector('.study-image-ghost');
    stage.classList.toggle('has-image-bridge', Boolean(bridge));
    status.textContent = state === 'pending' ? '图像载入中' : bridge ? '新图暂未载入 · 暂留上一幅环境' : '图像暂不可用';
    status.dataset.state = state;
    if(imageLabel)stage.setAttribute('aria-label',`${imageLabel}。${status.textContent}`);
  };
  return watchImage(image, {
    onPending: () => setState('pending'),
    onReady: () => {setState('ready');onReady?.(image);},
    onError: (_, error) => {setState('error');onError?.(image, error);}
  });
}

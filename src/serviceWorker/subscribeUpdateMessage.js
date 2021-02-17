import { HAVE_UPDATE_MESSAGE_TYPE } from './../helpers/const';

const checkToUpdate = () => {
  if (!navigator.serviceWorker.controller) {
    return false;
  }
  navigator.serviceWorker.controller.postMessage({
    type: HAVE_UPDATE_MESSAGE_TYPE,
  });
  return true;
};

export default onUpdate => {
  const allowUseServiceWorker =
    'serviceWorker' in navigator &&
    Boolean(process.env.APP_ENABLE_SERVICE_WORKER);

  if (!allowUseServiceWorker) {
    return;
  }

  const onMessage = event => {
    const { type } = event.data || {};
    if (type === HAVE_UPDATE_MESSAGE_TYPE) {
      onUpdate(true);
    }
  };

  navigator.serviceWorker.addEventListener('message', onMessage);
  if (navigator.serviceWorker.startMessages) {
    navigator.serviceWorker.startMessages();
  }

  navigator.serviceWorker.ready.then(checkToUpdate);

  const unsubscribeUpdateMessage = () =>
    navigator.serviceWorker.removeEventListener('message', onMessage);
  return unsubscribeUpdateMessage;
};

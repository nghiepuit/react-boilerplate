import {
  API_GET_VERSION,
  HAVE_UPDATE_MESSAGE_TYPE,
} from './../helpers/const';

const CALL_UDPATE_THROTTLE_TIMEOUT = 3000;
const CALL_UDPATE_INTERVAL = 14400000; // 4 hrs

let currentVersion;
let flushCaches;
let checkUpdateId;
let isHaveUpdate = false;
let isFetching = false;

const triggerClientUpdate = client => {
  if ('postMessage' in client) {
    client.postMessage({ type: HAVE_UPDATE_MESSAGE_TYPE });
  }
};

const handleOnUpdateAvailable = async () => {
  if (checkUpdateId) {
    clearInterval(checkUpdateId);
  }

  if (flushCaches) {
    await flushCaches();
  }

  self.clients.matchAll({ type: 'window' }).then(clients => {
    console.log('List clients', { clients });
    clients.forEach(triggerClientUpdate);
  });
};

const handleOnMesages = () => {
  self.addEventListener('message', event => {
    const { source, data } = event;
    const { type } = data || {};

    const isWindowClient = !!source && source.type === 'window';
    const isUpdateMessage = type === HAVE_UPDATE_MESSAGE_TYPE;

    const shouldTriggerUpdate =
      isUpdateMessage && isWindowClient && isHaveUpdate;
    if (shouldTriggerUpdate) {
      triggerClientUpdate(source);
    }
  });
};

const validateVersion = version => typeof version === 'string'; // && version.length === 8;

const checkIsHaveUpdate = async () => {
  const info = await fetch(API_GET_VERSION)
    .then(response => response.json())
    .catch(() => null);

  const { version } = info || {};
  const isValid = validateVersion(version);

  const isChanged = isValid && currentVersion !== version;
  console.log({ info, isChanged, isValid, version });
  return isChanged;
};

const checkUpdateVersion = async () => {
  const isUpdate = await checkIsHaveUpdate();
  if (!isUpdate) {
    return false;
  }

  isHaveUpdate = true;
  handleOnUpdateAvailable();
  return true;
};

const checkUpdateOnInterval = () =>
  (checkUpdateId = setInterval(checkUpdateVersion, CALL_UDPATE_INTERVAL));

export const checkUpdateOnFetch = () => {
  if (isFetching || isHaveUpdate) {
    return;
  }

  isFetching = true;
  setTimeout(() => {
    isFetching = false;
  }, CALL_UDPATE_THROTTLE_TIMEOUT);

  return checkUpdateVersion();
};

export default flush => {
  currentVersion = self.__version;
  flushCaches = flush;

  checkUpdateOnInterval();
  handleOnMesages();
  return true;
};

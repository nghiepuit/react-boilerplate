import { StoreUpdate, StoreUpdateAction, NormalizeStoreUpdate } from './type';
import { getObservedBitsFromName } from './helpers';

function hasTypeAndAlias<T>(
  patch: Partial<NormalizeStoreUpdate<T>>,
): patch is NormalizeStoreUpdate<T> {
  return typeof patch.type === 'string' && typeof patch.alias === 'string';
}

export default function updateStore<T>(
  patchs: StoreUpdate | StoreUpdate[],
  uri?: string,
  type?: string,
  alias?: string,
  options?: Partial<{
    observedBits: number;
  }>,
): StoreUpdateAction {
  const payload = (Array.isArray(patchs) ? patchs : [patchs])
    .map(patch => ({
      ...patch,
      uri: patch.uri || uri,
      type: patch.type || type,
      alias: patch.alias || alias,
    }))
    .filter(hasTypeAndAlias);

  const observedBits =
    options && options.observedBits !== undefined
      ? options.observedBits
      : payload.reduce((observedBits, path) => {
          return observedBits | getObservedBitsFromName(path.type);
        }, 0);

  return {
    type: '@@action/UPDATE_STORE',
    uri: payload[0].uri,
    payload,
    observedBits,
  };
}

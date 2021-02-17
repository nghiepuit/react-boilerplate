import { API_CALL_ACTION } from './apiConstants';

export const fetchWithToken = ({
  id,
  url,
  query,
  options,
  callbackActions,
  onPending,
  onResponse,
  onError,
}) => {
  return {
    type: API_CALL_ACTION,
    id,
    url,
    query,
    options,
    callbackActions,
    onPending,
    onResponse,
    onError,
  };
};

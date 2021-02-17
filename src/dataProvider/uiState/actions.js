import { INIT_NEW, POP_ITEM, PUSH_ITEM, REMOVE, SET } from './uiReducer';
const createUIAction = type => (uiStateName, payload) => {
  return {
    type,
    payload,
    meta: { uiStateName },
  };
};

const createUIAction2 = type => (uiStateName, payload) => {
  return {
    type,
    data: [
      {
        payload,
        meta: { uiStateName },
      },
    ],
  };
};

const initNew = createUIAction2(INIT_NEW);
const set = createUIAction(SET);
const pushItem = createUIAction(PUSH_ITEM);
const popItem = createUIAction(POP_ITEM);
const remove = createUIAction(REMOVE);

export const uiAction = { initNew, set, pushItem, popItem, remove };

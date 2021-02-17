import _isEmpty from 'lodash-es/isEmpty';
const uiInitNew = '@@ui/INIT_NEW';
const updateDataType = '@@action/UPDATE_STORE';

class ActionsBuffer {
  constructor() {
    this.buffer = {};
    this.bufferFlushCallback = {};
  }

  read(type) {
    return this.buffer[type];
  }
  
  push(next, action, mergeKey, isArray) {
    return new Promise((resolve, reject) => {
      if (_isEmpty(action[mergeKey])) {
        return;
      }
      const type = action.type;
      const bufferFlushCallback = this.bufferFlushCallback[type];
      if (!this.buffer[type]) {
        this.buffer[type] = isArray ? [] : {};
      }

      if (bufferFlushCallback) {
        cancelAnimationFrame(bufferFlushCallback);
      }
      if (isArray) {
        this.buffer[type] = this.buffer[type].concat(action[mergeKey]);
      } else {
        Object.assign(this.buffer[type], action[mergeKey]);
      }
      this.bufferFlushCallback[type] = requestAnimationFrame(() => {
        this.bufferFlushCallback[type] = null;
        const data = this.buffer[type];
        this.buffer[type] = null;
        try {
          resolve(next({ type, [mergeKey]: data }));
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }
}

class DataProviderActionsBuffer {
  constructor() {
    this.bufferObservedBits = 0;
    this.bufferFlushCallback = null;
  }
  push(next, action) {
    const bufferFlushCallback = this.bufferFlushCallback;

    if (bufferFlushCallback) {
      clearImmediate(bufferFlushCallback);
    }

    this.bufferObservedBits = this.bufferObservedBits | action.observedBits;
    const observedBits = this.bufferObservedBits;
    this.bufferFlushCallback = setImmediate(() => {
      this.bufferFlushCallback = null;
      this.bufferObservedBits = 0;
    });
    return next({ ...action, observedBits });
  }
}

const actionBuffer = new ActionsBuffer();
const dataProviderActionsBuffer = new DataProviderActionsBuffer();

const mergeDictionary = {
  [uiInitNew]: (next, action) => actionBuffer.push(next, action, 'data', true),
  [updateDataType]: (next, action) =>
    dataProviderActionsBuffer.push(next, action),
};

export default store => next => action => {
  if (mergeDictionary[action.type]) {
    return mergeDictionary[action.type](next, action);
  }
  return next(action);
};

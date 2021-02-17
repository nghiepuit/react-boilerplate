import LFUCache from 'node-lfu-cache';

export const renderResultCache = new LFUCache({
  max: 3000,
});

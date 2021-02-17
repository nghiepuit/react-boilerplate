export default async () => {
  const platform = process.env.PLATFORM;

  const htmlCacheName = `HTML: [${platform}]`;
  const apiCacheName = `API: [${platform}]`;
  const listCacheNames = [htmlCacheName, apiCacheName];
  const deleteHandles = listCacheNames.map(cacheName =>
    caches.delete(cacheName),
  );

  const cachesDeleted = await Promise.all(deleteHandles);
  return cachesDeleted;
};

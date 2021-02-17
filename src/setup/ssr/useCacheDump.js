import { renderResultCache } from './renderResultCache';

let totalRequest = 0;
let cacheRequest = 0;
export function trackHitRate(hit) {
  if (totalRequest === Number.MAX_SAFE_INTEGER) {
    totalRequest = 0;
    cacheRequest = 0;
  }
  totalRequest += 1;
  if (hit) {
    cacheRequest += 1;
  }
}

export default function useCacheDump(app) {
  app.get('/__cache__', function(req, res) {
    res.json(renderResultCache.dump());
  });
  app.get('/__hit_rate__', function(req, res) {
    res.json({
      totalRequest,
      cacheRequest,
      hitRate: (cacheRequest / totalRequest) * 100,
    });
  });
}

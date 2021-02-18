import { setImmediate } from 'core-js';
import fs from 'fs';
import _get from 'lodash-es/get';
import path from 'path';
import { ensurePrefix } from './ensurePrefix';
import ReactRenderer from './ReactRender';

const publicURLReg = new RegExp(process.env.PUBLIC_URL, 'g');

const assetFilesCache = new Map();
const readAssetFile = (file) => {
  if (!file) {
    return '';
  }
  if (!assetFilesCache.has(file)) {
    const asset = fs.readFileSync(
      path.resolve(process.cwd(), 'build/frontend' + file),
    );
    assetFilesCache.set(file, asset);
  }
  return assetFilesCache.get(file);
};

const assetJsonString = fs
  .readFileSync(
    path.resolve(process.cwd(), 'build/frontend/asset-manifest.json'),
  )
  .toString()
  .replace(publicURLReg, '');

const webpackStatsJsonString = fs
  .readFileSync(path.resolve(process.cwd(), 'build/frontend/stats.json'))
  .toString()
  .replace(publicURLReg, '');

const assetManifest = JSON.parse(assetJsonString);
const webpackStats = JSON.parse(webpackStatsJsonString);
const mainEntry = webpackStats.entrypoints.main.assets || [];
const appEntry =
  _get(webpackStats, ['namedChunkGroups', 'app', 'assets']) || [];
const namedChunkGroups = webpackStats.namedChunkGroups || {};

const isJS = (str) => /\.js$/.test(str);
const isCSS = (str) => /\.css$/.test(str);

const chunkAssetsCache = new Map();
function getAssetsByChunkName(publicUrl, chunkName) {
  try {
    if (chunkAssetsCache.has(chunkName)) {
      return chunkAssetsCache.get(chunkName);
    }
    const chunksGroup = namedChunkGroups[chunkName];
    if (!chunksGroup) {
      throw new Error('Can not find asset of chunk ' + chunkName);
    }
    const assets = chunksGroup.assets;

    const js = assets.filter(isJS).map((asset) => ({
      src: publicUrl + ensurePrefix(asset, '/'),
      as: 'script',
    }));

    const css = assets.filter(isCSS).map((asset) => ({
      src: publicUrl + ensurePrefix(asset, '/'),
      file: asset,
      as: 'style',
    }));

    const chunkAsset = {
      js,
      css,
    };
    chunkAssetsCache.set(chunkName, chunkAsset);
    return chunkAsset;
  } catch (ex) {
    console.log(`[MISSING CHUNK] ${chunkName}`);
    return {
      css: [],
      js: [],
    };
  }
}
export default function useReactSSR(app, config) {
  const routes = [
    ..._get(config, ['modules'], []).map((m) => m.getRoute()),
    ...config.routes,
  ];

  const vendorsCSS = mainEntry
    .filter(isCSS)
    .map((css) => config.publicUrl + ensurePrefix(css, '/'));

  const appCSS = appEntry
    .filter(isCSS)
    .map((css) => config.publicUrl + ensurePrefix(css, '/'));

  const runtimeJS = readAssetFile(assetManifest['runtime.js']);
  const fontFace = readAssetFile(`/fontface.${__COMMIT_HASH__}.sd`);
  const mainJS = mainEntry.filter(isJS).map((js) => ({
    src: config.publicUrl + ensurePrefix(js, '/'),
    as: 'script',
    mode: 'defer',
  }));
  const appJS = appEntry.filter(isJS).map((js) => ({
    src: config.publicUrl + ensurePrefix(js, '/'),
    as: 'script',
    mode: 'defer',
  }));

  app.use((req, res, next) => {
    const startTime = Date.now();
    const reactRenderer = new ReactRenderer({
      req,
      res,
      next,
      config,
      routes,
      assets: {
        vendorsCSS,
        appCSS,
        runtimeJS,
        fontFace,
        mainJS,
        appJS,
        namedChunkGroups,
        readAssetFile,
        getAssetsByChunkName: (chunkName) =>
          getAssetsByChunkName(config.publicUrl, chunkName),
      },
    });
    setImmediate(() => {
      reactRenderer.render(startTime);
    });
  });
}

import fs from 'fs';

const template = fs
  .readFileSync(`./build/frontend/template.${__COMMIT_HASH__}.sd`)
  .toString()
  .split('////%////');

export default class HtmlBuild {
  index = 0;
  result = '';

  writeString(str) {
    this.result += str;
  }

  writeTemplate() {
    if (!!template[this.index]) {
      this.result += template[this.index++];
    }
  }

  writeCommentLine(comment) {
    this.result += `<!-- ${comment} -->`;
  }

  writeStyle(style, dataHref) {
    this.result += `<style ${
      !!dataHref ? `data-href=${dataHref}` : ''
    }>${style}</style> `;
  }

  writePreloadAsset = assets => {
    for (let i in assets) {
      const asset = assets[i];
      this.result += `<link rel="preload" href="${asset.src}" as="${asset.as}">`;
    }
  };

  writePrefetchAsset = assets => {
    for (let i in assets) {
      const asset = assets[i];
      this.result += `<link rel="prefetch" href="${asset.src}" as="${asset.as}">`;
    }
  };

  writeScript = script => {
    this.result += `<script>${script}</script>`;
  };

  writeScriptTags = scripts => {
    for (let i in scripts) {
      const script = scripts[i];
      this.result += `<script ${script.mode ||
        ''} type="text/javascript" src="${script.src}"></script>`;
    }
  };

  writeStyleTags = styles => {
    for (let i in styles) {
      const style = styles[i];
      this.result += `<link rel="stylesheet" type="text/css" href="${style}">`;
    }
  };
}

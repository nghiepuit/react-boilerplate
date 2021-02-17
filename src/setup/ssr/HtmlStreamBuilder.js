import fs from 'fs';

const template = fs
  .readFileSync(`./build/frontend/template.${__COMMIT_HASH__}.sd`)
  .toString()
  .split('////%////');

export default class HtmlBuild {
  index = 0;
  constructor(res) {
    this.result = res;
  }

  writeString(str) {
    return new Promise(resolve => {
      this.result.write(str);
      setTimeout(resolve, 1);
    });
  }

  writeTemplate() {
    return new Promise(resolve => {
      this.result.write(template[this.index++]);
      setTimeout(resolve, 1);
    });
  }

  writeCommentLine(comment) {
    this.result.write(`<!-- ${comment} -->`);
  }

  writeStyle(style, dataHref) {
    return new Promise(resolve => {
      this.result.write(
        `<style ${!!dataHref ? `data-href=${dataHref}` : ''}>${style}</style> `,
      );
      setTimeout(resolve, 1);
    });
  }

  writePreloadAsset = assets => {
    return new Promise(resolve => {
      for (let i in assets) {
        const asset = assets[i];
        this.result.write(
          `<link rel="preload" href="${asset.src}" as="${asset.as}">`,
        );
      }
      setTimeout(resolve, 1);
    });
  };

  writePrefetchAsset = assets => {
    return new Promise(resolve => {
      for (let i in assets) {
        const asset = assets[i];
        this.result.write(
          `<link rel="prefetch" href="${asset.src}" as="${asset.as}">`,
        );
      }
      setTimeout(resolve, 1);
    });
  };

  writeScript = script => {
    return new Promise(resolve => {
      this.result.write(`<script>${script}</script>`);
      setTimeout(resolve, 1);
    });
  };

  writeScriptTags = scripts => {
    return new Promise(resolve => {
      for (let i in scripts) {
        const script = scripts[i];
        this.result.write(
          `<script ${script.mode || ''} type="text/javascript" src="${
            script.src
          }"></script>`,
        );
      }
      setTimeout(resolve, 1);
    });
  };

  writeStyleTags = styles => {
    return new Promise(resolve => {
      for (let i in styles) {
        const style = styles[i];
        this.result.write(
          `<link rel="stylesheet" type="text/css" href="${style}">`,
        );
      }
      setTimeout(resolve, 1);
    });
  };
}

import express from 'express';

export default function useStaticServer(app, contentConfig) {
  if (contentConfig) {
    app.use(require('compression')({ level: 9 }));
    app.use(
      express.static(contentConfig, {
        maxAge: '1d',
      }),
    );
  }
}

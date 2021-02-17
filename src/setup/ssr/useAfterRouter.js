import { Router } from 'express';

export default function useAfterRouter(app, config) {
  const router = new Router();
  const modules = config.modules || [];
  modules.forEach(m => m.afterRouter(router));
  app.use('/static-api', router);
}

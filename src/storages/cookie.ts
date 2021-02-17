import Cookie, { CookieGetOptions } from 'universal-cookie';
import { Storage } from './../redux';

export class CookieStorage implements Storage {
  cookie: Cookie;

  constructor(private readonly req: any, private readonly res: any) {
    if (req) {
      this.cookie = new Cookie(req.headers.cookie);
    } else {
      this.cookie = new Cookie();
    }
  }
  get(key: string, options: CookieGetOptions = {}): string {
    if (!key || key === '') {
      if (__CLIENT__) {
        return document.cookie;
      } else {
        return this.req.headers.cookie;
      }
    }
    return this.cookie.get(key, options);
  }

  getNumber(key: string, options: CookieGetOptions = {}) {
    return 0;
  }

  getObject<T extends Object>(
    key: string,
    options: CookieGetOptions = {},
  ): T | undefined {
    return undefined;
  }
  
  set(key: string, value: any, options: any = {}) {
    const hour = 3600000;
    if (__CLIENT__) {
      this.cookie.set(key, value, {
        expires: new Date(Date.now() + options.expires * hour),
      });
    } else {
      this.res.cookie(key, value, {
        expires: new Date(Date.now() + options.expires * hour),
      });
    }
  }
}

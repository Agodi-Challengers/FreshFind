
import { localStore, sessionStore } from './storage.js';

const BASE = 12408;

export function getVisitorCount() {
  let extra = 0;
  try {
    extra = Number(localStore?.getItem('ff:visits')) || 0;
    if (!sessionStore?.getItem('ff:counted')) {
      extra += 1;
      localStore?.setItem('ff:visits', String(extra));
      sessionStore?.setItem('ff:counted', '1');
    }
  } catch {
   
  }
  return BASE + extra;
}

export const formatCount = (n) => n.toLocaleString('en-NG');

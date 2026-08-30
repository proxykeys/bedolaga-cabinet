import { createHappCryptoLink } from '@kastov/cryptohapp';
import { encryptLink as encryptIncyLink } from '@incy/link-encoder/sync';

const TEMPLATE_RE = /\{\{[A-Z0-9_]+\}\}/;

export function hasTemplates(url: string): boolean {
  return TEMPLATE_RE.test(url);
}

/**
 * Old bot backends resolve prefix-hardcoded Subpage templates
 * (happ://crypt4/{{HAPP_CRYPT4_LINK}}) into happ://crypt4/happ://cryptN/... —
 * strip the outer prefix so the deep link stays openable.
 */
export function collapseDoubledCryptPrefix(url: string): string {
  return url.replace(/^happ:\/\/crypt\d+\/(?=happ:\/\/crypt)/i, '');
}

// jsencrypt's RSA-4096 takes up to tens of ms on weak devices and its padding is
// random (a new string every call) — cache per subscription URL so render-time
// resolution is cheap and stable within a session. Any single ciphertext is valid.
const cryptLinkCache = new Map<string, string | null>();

function cachedHappCryptoLink(url: string, version: 'v3' | 'v4'): string | null {
  const key = `${version}|${url}`;
  let link = cryptLinkCache.get(key);
  if (link === undefined) {
    if (cryptLinkCache.size >= 100) cryptLinkCache.clear();
    link = createHappCryptoLink(url, version, true);
    cryptLinkCache.set(key, link);
  }
  return link;
}

// INCY crypt1 links use AES-256-GCM (fast, deterministic cost) — same caching
// pattern for render-time stability.
const incyCryptLinkCache = new Map<string, string | null>();

function cachedIncyCryptoLink(url: string): string | null {
  let link = incyCryptLinkCache.get(url);
  if (link === undefined) {
    if (incyCryptLinkCache.size >= 100) incyCryptLinkCache.clear();
    try {
      link = encryptIncyLink(url, { name: 'ProxyKeys' });
    } catch {
      link = null;
    }
    incyCryptLinkCache.set(url, link);
  }
  return link;
}

interface ResolveContext {
  subscriptionUrl: string;
  username?: string;
}

export function resolveTemplate(template: string, ctx: ResolveContext): string {
  let result = template;

  // {{HAPP_CRYPT*_LINK}} resolves to a FULL happ://crypt.../ deep link; when the
  // template also hardcodes the prefix (happ://crypt4/{{HAPP_CRYPT4_LINK}}),
  // collapse it so we don't produce happ://crypt4/happ://crypt5/...
  result = result.replace(/happ:\/\/crypt\d+\/(?=\{\{HAPP_CRYPT[34]_LINK\}\})/gi, '');

  result = result.replace(/\{\{SUBSCRIPTION_LINK\}\}/g, ctx.subscriptionUrl);

  if (ctx.username) {
    result = result.replace(/\{\{USERNAME\}\}/g, ctx.username);
  }

  result = result.replace(/\{\{HAPP_CRYPT3_LINK\}\}/g, () => {
    return cachedHappCryptoLink(ctx.subscriptionUrl, 'v3') ?? ctx.subscriptionUrl;
  });

  result = result.replace(/\{\{HAPP_CRYPT4_LINK\}\}/g, () => {
    return cachedHappCryptoLink(ctx.subscriptionUrl, 'v4') ?? ctx.subscriptionUrl;
  });

  // {{INCY_CRYPT1_LINK}} resolves to a full incy://crypt1/<payload> deep link
  // (one-tap import in the INCY apps). The sync encoder keeps the whole
  // resolution synchronous — iOS/Safari deep-link navigation must stay inside
  // the tap's user-activation tick.
  result = result.replace(/\{\{INCY_CRYPT1_LINK\}\}/g, () => {
    return cachedIncyCryptoLink(ctx.subscriptionUrl) ?? ctx.subscriptionUrl;
  });

  return result;
}

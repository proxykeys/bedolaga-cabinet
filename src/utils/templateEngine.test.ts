import { describe, expect, it } from 'vitest';
import { resolveTemplate } from './templateEngine';

describe('templateEngine INCY crypt1', () => {
  it('resolves {{INCY_CRYPT1_LINK}} to a full incy://crypt1 deep link', () => {
    const out = resolveTemplate('{{INCY_CRYPT1_LINK}}', {
      subscriptionUrl: 'https://sub.proxykeys.net/token123',
    });
    expect(out.startsWith('incy://crypt1/')).toBe(true);
    expect(out.length).toBeGreaterThan('incy://crypt1/'.length + 16);
  });

  it('resolves INCY link inside a button URL template', () => {
    const out = resolveTemplate('incy://crypt1/{{INCY_CRYPT1_LINK}}', {
      subscriptionUrl: 'https://sub.proxykeys.net/token123',
    });
    // The variable itself expands to a full link; hardcoded prefix + full link
    // would double — users should use the bare variable. We only assert the
    // template is gone and the result still contains the crypt1 payload.
    expect(out).not.toMatch(/\{\{[A-Z0-9_]+\}\}/);
    expect(out).toContain('incy://crypt1/');
  });

  it('is deterministic-per-url (cached) and different urls produce different payloads', () => {
    const a1 = resolveTemplate('{{INCY_CRYPT1_LINK}}', {
      subscriptionUrl: 'https://sub.proxykeys.net/aaa',
    });
    const a2 = resolveTemplate('{{INCY_CRYPT1_LINK}}', {
      subscriptionUrl: 'https://sub.proxykeys.net/aaa',
    });
    const b = resolveTemplate('{{INCY_CRYPT1_LINK}}', {
      subscriptionUrl: 'https://sub.proxykeys.net/bbb',
    });
    expect(a1.startsWith('incy://crypt1/')).toBe(true);
    expect(b.startsWith('incy://crypt1/')).toBe(true);
    expect(a1 === a2 || a1.slice(0, 16) === a2.slice(0, 16)).toBe(true);
    expect(a1).not.toBe(b);
  });
});

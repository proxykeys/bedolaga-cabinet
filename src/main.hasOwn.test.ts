import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

function runPolyfill(setup: string, assertion: string) {
  const source = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
  const start = source.indexOf(
    "if (typeof (Object as { hasOwn?: unknown }).hasOwn !== 'function') {",
  );
  const end = source.indexOf('// Only initialize Telegram SDK', start);
  if (start < 0 || end < 0) throw new Error('Object.hasOwn bootstrap block not found');
  const polyfill = ts.transpile(source.slice(start, end));
  return runInNewContext(`${setup}\n${polyfill}\n${assertion}`);
}

describe('Object.hasOwn bootstrap', () => {
  it('installs a working fallback when the native method is unavailable', () => {
    expect(
      runPolyfill(
        'Object.hasOwn = undefined;',
        `[
          Object.hasOwn({ own: 1 }, 'own'),
          Object.hasOwn({ own: 1 }, 'missing'),
          Object.hasOwn(Object.create({ inherited: 1 }), 'inherited'),
          Object.hasOwn(Object.assign(Object.create(null), { own: 1 }), 'own')
        ].join(',')`,
      ),
    ).toBe('true,false,false,true');
  });

  it('preserves the native implementation when it exists', () => {
    expect(runPolyfill('const original = Object.hasOwn;', 'Object.hasOwn === original')).toBe(true);
  });
});

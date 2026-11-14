import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/*
 * GitHub Pages serves the demo under /homeassistant-sugartv-card/demo/, so a
 * root-absolute path ("/dist/...") resolves outside the site there. Locally it
 * still works, because `npm run demo` serves the repository root, which is why
 * only a test can catch it before a release publishes a blank demo.
 */
const demoDir = join(import.meta.dirname, '..', 'demo');
const pages = readdirSync(demoDir).filter((name) => name.endsWith('.html'));
const rootAbsolute = /(?:src|href)="\/(?!\/)|fetch\(\s*['"`]\/(?!\/)/g;

describe('demo pages load assets by relative path', () => {
    it.each(pages)('%s has no root-absolute path', (name) => {
        const html = readFileSync(join(demoDir, name), 'utf8');
        expect(html.match(rootAbsolute) ?? []).toEqual([]);
    });
});

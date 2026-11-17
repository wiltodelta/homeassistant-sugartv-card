import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

describe('build dependency security', () => {
    it('rejects repeated wildcard extglobs without exponential backtracking', () => {
        const matcherPath = require.resolve('picomatch');
        const script = `
            const assert = require('node:assert/strict');
            const pm = require(${JSON.stringify(matcherPath)});
            for (const [pattern, input] of [
                ['+(*a)', 'a'.repeat(80) + '!'],
                ['+(*)b', 'a'.repeat(80) + '!'],
                ['+(@(*a))', 'a'.repeat(80) + '!'],
            ]) {
                assert.equal(pm.isMatch(input, pattern), false);
            }
            assert.equal(pm.isMatch('test/example.test.js', '**/*.test.js'), true);
        `;
        const result = spawnSync(process.execPath, ['-e', script], {
            timeout: 2000,
            encoding: 'utf8',
        });
        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(0);
    });
});

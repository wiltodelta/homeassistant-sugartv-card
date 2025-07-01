import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import { execSync } from 'child_process';

function getVersion() {
    try {
        const tag = execSync('git describe --tags --abbrev=0')
            .toString()
            .trim();
        if (tag.startsWith('v')) {
            return tag.substring(1);
        }
        return tag;
    } catch (e) {
        try {
            const branch = execSync('git rev-parse --abbrev-ref HEAD')
                .toString()
                .trim();
            return `0.0.0-${branch}`;
        } catch (e) {
            return '0.0.0-dev';
        }
    }
}

export default {
    input: 'src/sugartv-card.js',
    output: {
        file: 'dist/sugartv-card.js',
        format: 'es',
        banner: `/* SugarTV Card version ${getVersion()} */`,
    },
    plugins: [
        replace({
            'process.env.VERSION': JSON.stringify(getVersion()),
            preventAssignment: true,
        }),
        resolve(),
        json(),
        terser({
            format: {
                comments: /SugarTV Card version/,
            },
        }),
    ],
};

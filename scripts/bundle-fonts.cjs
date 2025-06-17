const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const FONT_SOURCES = [
    'https://fonts.googleapis.com/css?family=Roboto:400,700&subset=cyrillic,cyrillic-ext,latin-ext',
    'https://overpass-30e2.kxcdn.com/overpass.css',
    'https://overpass-30e2.kxcdn.com/overpass-mono.css'
];

const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'sugartv-card-fonts.js');

// Function to download a file
function download(url, userAgent = 'node.js') {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': userAgent
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
    });
}

// Function to convert font to base64 data URI
async function processCss(cssContent, baseUrl) {
    const fontUrlRegex = /url\((['"]?)(.*?)\1\)/g;
    let newCss = cssContent;
    let match;

    // Use a while loop to handle multiple matches
    while ((match = fontUrlRegex.exec(cssContent)) !== null) {
        const originalUrl = match[2];
        // Only process woff2 files as they are the most modern and widely supported
        if (!originalUrl.includes('.woff2')) {
            continue;
        }

        const absoluteUrl = new URL(originalUrl, baseUrl).href;
        console.log(`  Downloading font: ${absoluteUrl}`);
        try {
            const fontBuffer = await download(absoluteUrl);
            const mimeType = 'font/woff2';
            const base64Font = fontBuffer.toString('base64');
            const dataUri = `url(data:${mimeType};base64,${base64Font})`;
            newCss = newCss.replace(originalUrl, dataUri);
        } catch (error) {
            console.error(`  Failed to process ${absoluteUrl}: ${error.message}`);
        }
    }
    
    // Remove other font formats from src to avoid trying to fetch them
    newCss = newCss.replace(/,\s*url\([^)]+\.(eot|woff|ttf|svg)[^)]*\)/g, '');

    return newCss;
}


async function main() {
    console.log('Starting font bundling process...');
    let allCss = '';

    for (const sourceUrl of FONT_SOURCES) {
        console.log(`Processing ${sourceUrl}...`);
        try {
            const userAgent = sourceUrl.includes('googleapis') ? 'Mozilla/5.0' : 'node.js';
            const cssBuffer = await download(sourceUrl, userAgent);
            const cssContent = cssBuffer.toString('utf-8');
            const processedCss = await processCss(cssContent, sourceUrl);
            allCss += processedCss + '\n';
        } catch (error) {
            console.error(`Could not process ${sourceUrl}: ${error.message}`);
        }
    }

    const outputContent = `/* This file is auto-generated. Do not edit. */
import { css } from 'lit';

export const fontStyles = css\`
${allCss}
\`;
`;

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`\nSuccessfully created ${OUTPUT_FILE}`);
}

main(); 
const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const fontUrls = [
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css?family=Overpass&display=swap',
];

function downloadFile(url, userAgent) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': userAgent } }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
      }
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function downloadBinaryFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
            }
            const data = [];
            response.on('data', (chunk) => {
                data.push(chunk);
            });
            response.on('end', () => {
                resolve(Buffer.concat(data));
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function processCss(cssContent) {
    const urlRegex = /url\(([^)]+)\)/g;
    let newCss = cssContent;
    
    const replacements = [];

    // Use a new regex exec loop to avoid infinite loops with string replacement
    let urlMatch;
    // Create a copy for iteration because we are modifying newCss
    const cssContentForRegex = cssContent;
    while ((urlMatch = urlRegex.exec(cssContentForRegex)) !== null) {
        const originalUrlDeclaration = urlMatch[0];
        const fullUrl = urlMatch[1].replace(/['"]/g, '');

        if (fullUrl.endsWith('.woff2') || fullUrl.endsWith('.woff')) {
            try {
                console.log(`Downloading font: ${fullUrl}`);
                const fontBuffer = await downloadBinaryFile(fullUrl);
                const base64Font = fontBuffer.toString('base64');
                const extension = path.extname(new URL(fullUrl).pathname).substring(1);
                const mimeType = `font/${extension}`;
                const dataUri = `url(data:${mimeType};base64,${base64Font})`;
                
                replacements.push({
                    original: originalUrlDeclaration,
                    replacement: dataUri,
                });
            } catch (error) {
                console.error(`Failed to process font URL ${fullUrl}:`, error);
            }
        }
    }

    for (const { original, replacement } of replacements) {
        newCss = newCss.split(original).join(replacement);
    }
    
    // Remove comments
    newCss = newCss.replace(/\/\*[^]*?\*\//g, "");

    // Remove any @font-face rules that don't contain a data URI, as they are useless without a downloadable font.
    const fontFaceRegex = /@font-face\s*{[^}]+}/g;
    const finalCssBlocks = newCss.match(fontFaceRegex);
    if (!finalCssBlocks) return '';

    const uniqueBlocks = [...new Set(finalCssBlocks)];
    return uniqueBlocks.filter(block => block.includes('data:font/')).join('\n\n');
}

async function main() {
  try {
    let allCss = '';
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
    ];

    for (const url of fontUrls) {
      console.log(`Fetching CSS from ${url}...`);
      let css = '';
      for (const agent of userAgents) {
          console.log(`  using user agent: ${agent}`);
          css += await downloadFile(url, agent);
      }
      
      const processedCss = await processCss(css);
      allCss += processedCss + '\n\n';
    }
    
    // Clean up css
    allCss = allCss.replace(/;\s*}/g, ' }'); // remove trailing semicolon
    allCss = allCss.replace(/\/\*[^]*?\*\//g, ""); // remove comments
    allCss = allCss.replace(/\n\s*\n/g, '\n'); // remove empty lines


    const outputFile = path.join(__dirname, '..', 'src', 'sugartv-card-fonts.js');
    const outputContent = `/* This file is auto-generated. Do not edit. */
import { css } from 'lit';

export const fontStyles = css\`
${allCss}
\`;
`;
    await fs.writeFile(outputFile, outputContent);
    console.log(`Successfully created ${outputFile}`);
  } catch (error) {
    console.error('Error bundling fonts:', error);
    process.exit(1);
  }
}

main();
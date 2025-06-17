const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const fontUrls = [
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css?family=Overpass&display=swap',
];

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';

function downloadFile(url) {
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
        https.get(url, { headers: { 'User-Agent': userAgent } }, (response) => {
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
    const fontFaceRegex = /@font-face\s*{[^}]+}/g;
    const urlRegex = /url\(([^)]+)\)/g;
    let newCss = cssContent;
    let match;

    while ((match = fontFaceRegex.exec(cssContent)) !== null) {
        const fontFaceBlock = match[0];
        let urlMatch;
        while ((urlMatch = urlRegex.exec(fontFaceBlock)) !== null) {
            const fullUrl = urlMatch[1].replace(/['"]/g, '');
            if (fullUrl.endsWith('.woff2')) {
                try {
                    console.log(`Downloading font: ${fullUrl}`);
                    const fontBuffer = await downloadBinaryFile(fullUrl);
                    const base64Font = fontBuffer.toString('base64');
                    const dataUri = `url(data:font/woff2;base64,${base64Font})`;
                    newCss = newCss.replace(urlMatch[0], dataUri);
                    
                    // Remove other font formats from the src property to keep only woff2
                     newCss = newCss.replace(/,\s*url\([^)]+\.(eot|woff|ttf|svg)[^)]*\) format\('[^']+'\)/g, '');
                     newCss = newCss.replace(/url\([^)]+\.(eot|woff|ttf|svg)[^)]*\);/g, ';');


                } catch (error) {
                    console.error(`Failed to process font URL ${fullUrl}:`, error);
                }
            }
        }
    }

    // A bit more aggressive cleanup for other formats that might be on separate lines or formats
    newCss = newCss.replace(/src:\s*local\([^)]*\),\s*url\([^)]+\.woff2[^)]*\) format\('woff2'\);/g, (match) => {
         const woff2Url = /url\([^)]+\.woff2[^)]*\)/.exec(match)[0];
         return `src: ${woff2Url} format('woff2');`;
    });

    // Remove entire @font-face blocks if they don't contain a woff2 data URI
    const finalCssBlocks = newCss.match(fontFaceRegex);
    if (!finalCssBlocks) return '';

    return finalCssBlocks.filter(block => block.includes('data:font/woff2;base64')).join('\n\n');
}

async function main() {
  try {
    let allCss = '';
    for (const url of fontUrls) {
      console.log(`Fetching CSS from ${url}...`);
      const css = await downloadFile(url);
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
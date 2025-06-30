import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
    try {
        let filePath = req.url === '/' ? '/demo/index.html' : req.url;
        
        // Security: prevent directory traversal
        if (filePath.includes('..')) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        const fullPath = join(projectRoot, filePath);
        
        try {
            const data = await readFile(fullPath);
            const ext = extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end(`File not found: ${filePath}`);
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
        }
    } catch (error) {
        res.writeHead(500);
        res.end('Internal server error');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Demo server running at http://localhost:${PORT}`);
    console.log(`📱 SugarTV Card demo available!`);
    console.log(`📝 Open http://localhost:${PORT} in your browser`);
    console.log(`⏹️  Press Ctrl+C to stop`);
}); 
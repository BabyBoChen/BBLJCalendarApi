const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const calendarService = require("./services/calendarService.js");

const PORT = 8080;

const MIME_TYPES = {
    default: 'application/octet-stream',
    html: 'text/html; charset=UTF-8',
    js: 'application/javascript',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpg',
    gif: 'image/gif',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
    json: 'application/json',
};

const STATIC_PATH = path.join(process.cwd(), './wwwroot');

const toBool = [() => true, () => false];

const router = /** @param requestUrl {String}*/ async (requestUrl) => {
    const paths = [STATIC_PATH, requestUrl];
    if (requestUrl.endsWith('/')) {
        paths.push('index.html');
    }
    const filePath = path.join(...paths);
    const pathTraversal = !filePath.startsWith(STATIC_PATH);
    const exists = await fs.promises.access(filePath).then(...toBool);
    const found = !pathTraversal && exists;
    const streamPath = found ? filePath : STATIC_PATH + '/404.html';
    const ext = path.extname(streamPath).substring(1).toLowerCase();
    const stream = fs.createReadStream(streamPath);
    return { found, ext, stream };
};

http.createServer(async (req, res) => {
    const q = url.parse(req.url);
    if (q.pathname.startsWith("/api")) {
        calendarService(req, res);
        console.log(`${req.method} ${req.url} ${200}`);
    } else if (q.pathname.startsWith("/data/")) {
        res.writeHead(403, { 'Content-Type': MIME_TYPES["html"] });
        res.end();
    } else {
        const file = await router(req.url);
        const statusCode = file.found ? 200 : 404;
        const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
        res.writeHead(statusCode, { 'Content-Type': mimeType, 'Cache-Control': 'public, max-age=604800' });
        file.stream.pipe(res);
        console.log(`${req.method} ${req.url} ${statusCode}`);
    }
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);

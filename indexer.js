const fs = require('fs');
const path = require('path');

function readLevel(pathname) {
    const stat = fs.statSync(pathname);
    if (stat.isFile()) {
        return path.basename(pathname);
    }
    const dir = fs.readdirSync(pathname);
    return {
        name: path.basename(pathname),
        data: dir.map(d => readLevel(path.join(pathname, d)))
    };
}

console.log(JSON.stringify({
    name: '/',
    data: [{
        name: 'static',
        data: [readLevel(path.join(__dirname, 'static/tile-pack-2'))]
    }]
}, null, 4));
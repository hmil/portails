export async function tileSheet(ctx: CanvasRenderingContext2D) {

    const [bgTile1, bgTile2, ...tiles] = await Promise.all([
        loadImage('/static/tiles-pack-1/BGTile (3).png'),
        loadImage('/static/tiles-pack-1/BGTile (4).png'),
        ...[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => loadImage(`static/tiles-pack-1/Tile (${n}).png`))
    ]);

    ctx.drawImage(bgTile1, 0, 0);
    ctx.drawImage(bgTile1, 256, 256);
    ctx.drawImage(bgTile2, 256, 0);
    ctx.drawImage(bgTile2, 0, 256);

    for (let i = 0 ; i < tiles.length ; i++) {
        ctx.drawImage(tiles[i], (256 * (i % 8)) + 512, ~~(i/8) * 256);
    }
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        }
        img.onerror = reject;
        img.src = src;
    });
}
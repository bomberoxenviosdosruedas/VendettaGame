export type Tile = {
    id: number;
    type: 'gray' | 'green' | 'blue' | 'orange';
    isCenter?: boolean;
    info?: {
        position: string;
        owner: string;
        points: number;
    };
};

const tileTypes: Tile['type'][] = ['gray', 'green', 'blue', 'orange'];
const totalTiles = 15 * 15;

export const mapData: Tile[] = Array.from({ length: totalTiles }, (_, i) => {
    const x = i % 15;
    const y = Math.floor(i / 15);
    const tile: Tile = {
        id: i,
        type: tileTypes[Math.floor(Math.random() * tileTypes.length)],
    };

    if (x === 7 && y === 7) {
        tile.isCenter = true;
        tile.info = {
            position: '34:13:128',
            owner: 'niyose',
            points: 13,
        };
    }
    
    return tile;
});

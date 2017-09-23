
import { Controls } from './interfaces';

export const FPS = 60;
export const CONTROLS: Controls = {
    38: 'thrust',
    37: 'rotate-left',
    39: 'rotate-right',
    32: 'fire'
}
export const THRUST_SPD = 3;

/**
 * 2d collection defines vertices of ship,
 * will be offset from pos.x && pos.y in renderShip()
 */
export const SHIP_VERT = [
    // north v
    [0, -10],
    // west v
    [-10, 0],
    // east v
    [10, 0]
];
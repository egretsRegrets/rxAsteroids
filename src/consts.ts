
import { Controls } from './interfaces';

export const FPS = 60;
export const CONTROLS: Controls = {
    38: 'thrust',
    37: 'rotate-left',
    39: 'rotate-right',
    32: 'fire'
}
export const CTRL_KEYCODES = {
    'thrust': 38,
    'rotate-left': 37,
    'rotate-right': 39,
    'fire': 32
}
/**
 * chang THRUST_SPD to ROTATION_NUM, or something
 */
export const THRUST_SPD = 4.5;
export const THRUST_CEIL = 1.5;
export const THRUST_FLOOR = .25;
export const MISSILE_SPD = 5;

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
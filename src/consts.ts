
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

export const THRUST_CEIL = 1.5;
export const THRUST_FLOOR = .25;
export const ROTATION_INCREMENT = 4.5;

export const ASTEROID_SPD = 1;
export const MISSILE_SPD = 5;

// 2d collection defines vertices of ship,
    // will be offset from pos.x && pos.y in renderShip()
 
export const SHIP_VERT = [
    // north v
    [0, -10],
    // west v
    [-10, 0],
    // east v
    [10, 0]
];

export const ASTEROID_RADIUS = 35;

// collection of points making up the various paths
    // of asteroid outline types
export const ASTEROID_OUTLINE_PATHS = {
    'A': [
        [0, -ASTEROID_RADIUS/1.7],
        [-ASTEROID_RADIUS/2, -ASTEROID_RADIUS],
        [-ASTEROID_RADIUS, -ASTEROID_RADIUS/2],
        [-ASTEROID_RADIUS, ASTEROID_RADIUS/2],
        [-ASTEROID_RADIUS/1.3, ASTEROID_RADIUS/1.2],
        [ASTEROID_RADIUS/2, ASTEROID_RADIUS],
        [ASTEROID_RADIUS, ASTEROID_RADIUS/2],
        [ASTEROID_RADIUS/1.5, 0],
        [ASTEROID_RADIUS, -ASTEROID_RADIUS/2],
        [ASTEROID_RADIUS/2, -ASTEROID_RADIUS]
    ],
    'B': [
        [10, -ASTEROID_RADIUS/1.3],
        [-ASTEROID_RADIUS/1.8, -ASTEROID_RADIUS],
        [-ASTEROID_RADIUS, -ASTEROID_RADIUS/2],
        [-ASTEROID_RADIUS/1.6, 0],
        [-ASTEROID_RADIUS, ASTEROID_RADIUS/2],
        [-ASTEROID_RADIUS/1.8, ASTEROID_RADIUS],
        [-ASTEROID_RADIUS/2, ASTEROID_RADIUS/1.3],
        [ASTEROID_RADIUS/1.8, ASTEROID_RADIUS],
        [ASTEROID_RADIUS, ASTEROID_RADIUS/2.5],
        [ASTEROID_RADIUS/2.2, -ASTEROID_RADIUS/2.8],
        [ASTEROID_RADIUS/1.1, -ASTEROID_RADIUS/1.8],
        [ASTEROID_RADIUS/2.2, -ASTEROID_RADIUS]
    ],
    'C': [
        [-5, -ASTEROID_RADIUS/1.6],
        [-ASTEROID_RADIUS/2, -ASTEROID_RADIUS],
        [-ASTEROID_RADIUS, -ASTEROID_RADIUS/2],
        [-ASTEROID_RADIUS/1.6, 0],
        [-ASTEROID_RADIUS, ASTEROID_RADIUS/2],
        [-ASTEROID_RADIUS/2, ASTEROID_RADIUS],
        [-ASTEROID_RADIUS/2.8, ASTEROID_RADIUS/1.4],
        [ASTEROID_RADIUS/1.8, ASTEROID_RADIUS],
        [ASTEROID_RADIUS, ASTEROID_RADIUS/2.5],
        [ASTEROID_RADIUS/1.4, -ASTEROID_RADIUS/1.5],
        [ASTEROID_RADIUS, -ASTEROID_RADIUS],
        [ASTEROID_RADIUS/1.5, -ASTEROID_RADIUS]
    ],
    'D': [
        [0, -ASTEROID_RADIUS/1.3],
        [-ASTEROID_RADIUS/2.8, -ASTEROID_RADIUS/1.3],
        [-ASTEROID_RADIUS, -ASTEROID_RADIUS/2.5],
        [-ASTEROID_RADIUS/1.4, ASTEROID_RADIUS/1.8],
        [-ASTEROID_RADIUS/1.8, ASTEROID_RADIUS/1.8],
        [ASTEROID_RADIUS/2, ASTEROID_RADIUS],
        [ASTEROID_RADIUS/1.5, ASTEROID_RADIUS/2],
        [ASTEROID_RADIUS, 0],
        [ASTEROID_RADIUS, -ASTEROID_RADIUS/2],
        [ASTEROID_RADIUS/2, -ASTEROID_RADIUS]
    ]
}

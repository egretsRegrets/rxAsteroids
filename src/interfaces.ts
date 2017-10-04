
export interface Point2d{
    x: number;
    y: number;
}

export interface Controls {
    [key: number]: string;
}

export interface KeysDown {
    38: boolean;
    37: boolean;
    39: boolean;
    32: boolean;
}

export type PilotInput = "thrust" | "fire" | "rotate-left" | "rotate-right" | "no-input";

export interface ShipMovement {
    keyStateTbl: object;
    shipThrust: number;
    shipRotation: number;
}

export interface ShipPosition {
    center: Point2d;
    rotation: number;
    rotationAtThrust: number;
    boundsMax: Point2d;
}

export interface Scene {
    ship: {center: Point2d, rotation: number},
    missiles: Missile[],
    asteroids: Asteroid[]
}

export interface Launch {
    missileStart: Point2d;
    missileAngle: number;
    launchNum: number;
}

export interface Asteroid{
    driftAngle: number;
    center: Point2d;
    boundsMax: Point2d;
}

export interface Missile {
    firingAngle: number;
    pos: Point2d;
}

export interface MState {
    missiles: Missile[];
    mNum: number;
    boundsMax: Point2d; 
}

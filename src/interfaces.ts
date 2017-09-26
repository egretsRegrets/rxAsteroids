
export interface Point2d{
    x: number;
    y: number;
}

export interface Controls {
    [key: number]: string;
}

export type PilotInput = "thrust" | "fire" | "rotate-left" | "rotate-right" | "no-input";

export interface ShipMovement {
    pilotInput: PilotInput,
    shipThrust: number,
    shipRotation: number
}

export interface ShipPosition {
    center: Point2d;
    rotation: number;
    rotationAtThrust: number;
    boundsMax: Point2d;
}

export interface Scene {
    ship: {center: Point2d, rotation: number},
    missiles: any
}

export interface Launch {
    missileStart: Point2d;
    missileAngle: number;
    launchNum: number;
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



export interface Point2d{
    x: number;
    y: number;
}

export interface Controls {
    [key: number]: string;
}

export interface ShipPosition {
    center: Point2d;
    rotation: number;
    rotationAtThrust: number;
}

export type PilotInput = "thrust" | "fire" | "rotate-left" | "rotate-right" | "no-input";

export interface ShipMovement {
    pilotInput: PilotInput,
    shipThrust: number,
    shipRotation: number
}

export interface Ship{
    rotation: number;
    center: Point2d;
    fire: boolean;
}


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

type pilotInput = "thrust" | "fire" | "rotate-left" | "rotate-right";

export interface ShipMovement {
    pilotInput: pilotInput,
    shipThrust: number,
    shipRotation: number
}

export interface Ship{
    rotation: number;
    center: Point2d;
    fire: boolean;
}

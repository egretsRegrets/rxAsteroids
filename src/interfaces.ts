
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
}

export interface Ship{
    rotation: number;
    center: Point2d;
    fire: boolean;
}

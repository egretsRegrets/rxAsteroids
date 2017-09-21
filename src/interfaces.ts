
export interface Point2d{
    x: number;
    y: number;
}

export interface Controls {
    [key: number]: string;
}

export interface CanvasBasis {
    canvasWidth: number;
    canvasHeight: number;
    cols: number;
    rows: number;
    gapSize: 1;
    cellSize: 10;
}

export interface Ship {
    rotation: number;
    thrust: number;
    fire: boolean;
}
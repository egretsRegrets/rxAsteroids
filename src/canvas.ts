
import { CanvasBasis } from './interfaces';

let canvasBasis: CanvasBasis = <CanvasBasis>{};

export function createCanvasElement() {
    defineCanvasBasis();
    const canvas = document.createElement('canvas');
    canvas.width = canvasBasis.canvasWidth;
    canvas.height = canvasBasis.canvasHeight;
    return canvas;
}

function defineCanvasBasis() {
    canvasBasis.canvasWidth = window.innerWidth;
    canvasBasis.canvasHeight = window.innerHeight;
    canvasBasis.cols = Math.floor(canvasBasis.canvasWidth / canvasBasis.cellSize);
    canvasBasis.rows = Math.floor(canvasBasis.canvasHeight / canvasBasis.cellSize);
}

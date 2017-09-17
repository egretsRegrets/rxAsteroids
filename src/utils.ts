
import { createCanvasElement } from './canvas';

export function generateAsteroid() {
    console.log('utils test');
}

export function generateCanvas(canvas, ctx) {
    if(document.getElementById("asteroids_canvas")){
        document.getElementById("asteroids_canvas").remove();
    } 
    canvas = createCanvasElement();
    ctx = canvas.getContext('2d');
    canvas.setAttribute("id", "asteroids_canvas");
    document.body.appendChild(canvas);
}

import { Ship } from './interfaces';
import { createCanvasElement } from './canvas';

export function generateCanvas() {
    if(document.getElementById("asteroids_canvas")){
        document.getElementById("asteroids_canvas").remove();
    } 
    let canvas = createCanvasElement();
    let ctx = canvas.getContext('2d');
    canvas.setAttribute("id", "asteroids_canvas");
    document.body.appendChild(canvas);
    return {canvas, ctx};
}

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / 10
    : angle += (Math.PI / 3) / 10;
}

export function resolveThrust(thrust, accel) {
    thrust ++;
    return thrust;
}

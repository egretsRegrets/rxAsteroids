
import { Ship, Point2d } from './interfaces';
import { THRUST_SPD, SHIP_VERT } from './consts';

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;

export function renderScene(canvas, ctx, scene) {
    renderBackground(canvas, ctx);
    renderShip(ctx, scene.ship);
}

function renderShip(ctx, ship: Ship) {
    let canvas = <HTMLCanvasElement>document.getElementById('asteroids_canvas');
    let con = canvas.getContext("2d");
    let angle = ship.rotation;
    // defining ship triangle
    con.save();
    con.translate(ship.center.x, ship.center.y);
    con.rotate(angle);
    con.strokeStyle = '#EEE';
    // pre-drawing positioning
    con.beginPath();
    // SHIP_VERT are standard vertex pos, in reference to pos.x, pos.y
    con.moveTo(SHIP_VERT[0][0], SHIP_VERT[0][1]);
    // begin drawing
    con.lineTo(SHIP_VERT[1][0], SHIP_VERT[1][1]);
    con.lineTo(SHIP_VERT[2][0], SHIP_VERT[2][1]);
    con.closePath();
    con.stroke();
    con.restore();

}

function renderBackground(canvas: HTMLCanvasElement, ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}


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

/*
var can = document.getElementById("canvas"),
    con = can.getContext("2d"),
    pos = { x:can.width/2, y:can.height/2 },
    v = [[0,-10],[-10,0],[10,0]],
    angle = 0;

setInterval(function(){
    con.save();
    con.fillStyle = "rgba(0, 0, 0, 0.2)";
    con.fillRect(0, 0, can.width, can.height);
    con.restore();
    con.save();
    con.translate(pos.x,pos.y);
    con.rotate(angle);
    con.fillStyle = "rgba(150, 255, 0, 0.3)";
    con.strokeStyle = "#96FF00";
    con.beginPath();
    con.moveTo(v[0][0],v[0][1]);
    con.lineTo(v[1][0],v[1][1]);
    con.lineTo(v[2][0],v[2][1]);
    con.closePath();
    con.stroke();
    con.fill();
    con.restore();
},33);

document.addEventListener("keydown",function (e) {
    switch (e.charCode || e.keyCode){ //
        // turning
        case 37:angle-=(Math.PI/3)/10;  break;
        case 39:angle+=(Math.PI/3)/10; break;
        // accelerator
        case 38:
        pos.x += 3 * Math.sin(angle);
        pos.y += -3 * Math.cos(angle);
        break;
        // brake
        case 40:; break;
      }
});

http://jsfiddle.net/sadasant/3sBRh/4/

*/
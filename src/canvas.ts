
import { CanvasBasis } from './interfaces';

let canvasBasis: CanvasBasis = <CanvasBasis>{};

export function createCanvasElement() {
    defineCanvasBasis();
    const canvas = document.createElement('canvas');
    canvas.width = canvasBasis.canvasWidth;
    canvas.height = canvasBasis.canvasHeight;
    return canvas;
}

export function renderScene(canvas, scene) {
    renderBackground(canvas.ctx);
    renderShip(scene);
}

function defineCanvasBasis() {
    canvasBasis.canvasWidth = window.innerWidth;
    canvasBasis.canvasHeight = window.innerHeight;
    canvasBasis.cols = Math.floor(canvasBasis.canvasWidth / canvasBasis.cellSize);
    canvasBasis.rows = Math.floor(canvasBasis.canvasHeight / canvasBasis.cellSize);
}

function renderShip(ship) {
    
}

function renderBackground(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasBasis.canvasWidth, canvasBasis.canvasHeight);
}

/*
var can = document.getElementById("canvas"),
    con = can.getContext("2d"),
    pos = { x:can.width/2, y:can.height/2 },
    v = [[0,-10],[-10,0],[10,0]],
    angle = 0,
    angleRad = angle * (Math.PI/180);

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
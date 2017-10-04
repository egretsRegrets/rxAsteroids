
import {
    ShipPosition,
    Point2d,
    Scene,
    Missile,
    Asteroid
} from './interfaces';
import { 
    THRUST_SPD,
    SHIP_VERT,
    ASTEROID_RADIUS,
    ASTEROID_PATHS
} from './consts';

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;

export function renderScene(canvas, ctx, scene: Scene) {
    renderBackground(canvas, ctx);
    renderShip(ctx, scene.ship);
    renderMissiles(ctx, scene.missiles);
    renderAsteroids(ctx, scene.asteroids);
}

function renderBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function renderShip(ctx: CanvasRenderingContext2D, ship) {
    let angle = ship.rotation;
    // defining ship triangle
    ctx.save();
    ctx.translate(ship.center.x, ship.center.y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#EEE';
    // pre-drawing positioning
    ctx.beginPath();
    // SHIP_VERT are standard vertex pos, in reference to pos.x, pos.y
    ctx.moveTo(SHIP_VERT[0][0], SHIP_VERT[0][1]);
    // begin drawing
    ctx.lineTo(SHIP_VERT[1][0], SHIP_VERT[1][1]);
    ctx.lineTo(SHIP_VERT[2][0], SHIP_VERT[2][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

}

function renderMissiles(ctx: CanvasRenderingContext2D, missiles: Missile[]) {
    missiles.forEach(missile => {
        ctx.save();
        ctx.translate(missile.pos.x, missile.pos.y);
        ctx.rotate(missile.firingAngle);
        ctx.strokeStyle = '#EEE';
        ctx.beginPath();
        // starting point of projectile line
        ctx.moveTo(0, -16);
        ctx.lineTo(0, -24);
        ctx.stroke();
        ctx.restore();
    });
}

function renderAsteroids(ctx: CanvasRenderingContext2D, asteroids: Asteroid[]) {
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.center.x, asteroid.center.y);
        ctx.strokeStyle = '#EEE';
        ctx.beginPath();
        // path for square asteroid
        /*
        ctx.moveTo(-ASTEROID_RADIUS, -ASTEROID_RADIUS);
        ctx.lineTo(-ASTEROID_RADIUS, ASTEROID_RADIUS);
        ctx.lineTo(ASTEROID_RADIUS, ASTEROID_RADIUS);
        ctx.lineTo(ASTEROID_RADIUS, -ASTEROID_RADIUS);
        */
        drawAsteroidOutline(ctx, asteroid.outlineType);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    });
}

function drawAsteroidOutline(ctx: CanvasRenderingContext2D, outlineType) {
    ASTEROID_PATHS[outlineType].forEach((coordSet, index) => {
        if(index === 0){
            ctx.moveTo(coordSet[0], coordSet[1]);
        } else {
            ctx.lineTo(coordSet[0], coordSet[1]);
        }
    });
}

function drawText(
    ctx: CanvasRenderingContext2D,
    text,
    startX,
    startY,
    fillStyle,
    fontSize,
    horizontalAlign = 'center',
    verticalAlign = 'middle'
) {
    ctx.fillStyle = fillStyle;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = horizontalAlign;
    ctx.textBaseline = verticalAlign;
    ctx.fillText(text, startX, startY);
}

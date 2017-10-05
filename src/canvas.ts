
import {
    ShipPosition,
    Point2d,
    Scene,
    Missile,
    Asteroid
} from './interfaces';
import { 
    ROTATION_INCREMENT,
    SHIP_PATH,
    ASTEROID_RADIUS,
    ASTEROID_OUTLINE_PATHS
} from './consts';

const THEME_COLORS = {
    background_fill: '#3D1F3E',
    ship_asteroid_stroke: '#F1686E',
    missile_color: '#FEF6E7'
};

export function renderScene(canvas, ctx, scene: Scene) {
    renderBackground(canvas, ctx);
    renderShip(ctx, scene.ship);
    renderMissiles(ctx, scene.missiles);
    renderAsteroids(ctx, scene.asteroids);
}

function renderBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = THEME_COLORS.background_fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function renderShip(ctx: CanvasRenderingContext2D, ship) {
    let angle = ship.rotation;
    // draw cockpit circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(ship.center.x, ship.center.y, 4.75, 0, 2 * Math.PI, false);
    ctx.strokeStyle = THEME_COLORS.ship_asteroid_stroke;
    ctx.stroke();
    ctx.restore();
    // defining ship triangle
    ctx.save();
    ctx.translate(ship.center.x, ship.center.y);
    ctx.rotate(angle);
    ctx.strokeStyle = THEME_COLORS.ship_asteroid_stroke;
    // pre-drawing positioning
    ctx.beginPath();
    // SHIP_PATH are fixed in reference to ship.center.x and ship.center.y
    ctx.moveTo(SHIP_PATH[0][0], SHIP_PATH[0][1]);
    // begin drawing
    ctx.lineTo(SHIP_PATH[1][0], SHIP_PATH[1][1]);
    ctx.lineTo(SHIP_PATH[2][0], SHIP_PATH[2][1]);
    ctx.lineTo(SHIP_PATH[3][0], SHIP_PATH[3][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

}

function renderMissiles(ctx: CanvasRenderingContext2D, missiles: Missile[]) {
    missiles.forEach(missile => {
        ctx.save();
        ctx.translate(missile.pos.x, missile.pos.y);
        ctx.rotate(missile.firingAngle);
        ctx.strokeStyle = THEME_COLORS.missile_color;
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
        ctx.strokeStyle = THEME_COLORS.ship_asteroid_stroke;
        ctx.beginPath();
        drawAsteroidOutline(ctx, asteroid.outlineType);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    });
}

function drawAsteroidOutline(ctx: CanvasRenderingContext2D, outlineType) {
    ASTEROID_OUTLINE_PATHS[outlineType].forEach((coordSet, index) => {
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

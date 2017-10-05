
import {
    ShipPosition,
    Point2d,
    ShipMovement,
    Launch,
    Missile,
    MState,
    KeysDown,
    Asteroid
} from './interfaces';
import {
    ROTATION_INCREMENT,
    THRUST_CEIL,
    THRUST_FLOOR,
    MISSILE_SPD,
    CTRL_KEYCODES,
    ASTEROID_SPD,
    ASTEROID_RADIUS
} from './consts';

export function mapKeysDown(keysDown: KeysDown, e: KeyboardEvent) {
    keysDown[e.keyCode] = e.type == 'keydown';
    return keysDown;
}

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / ROTATION_INCREMENT
    : angle += (Math.PI / 3) / ROTATION_INCREMENT;
}

export function resolveThrust(velocity, acceleration) {
    // if new velocity is higher than floor and less than ceiling
        // then make velocity equal the sum of velocity and accel
    if ( 
        velocity + acceleration >= THRUST_FLOOR &&
        velocity + acceleration <= THRUST_CEIL
    ){
        return velocity + acceleration;
    }
    // if we haven't yet reached floor speed:
    else if (
        velocity < THRUST_FLOOR &&
        velocity + acceleration < THRUST_FLOOR
    ){
        // make sure we don't decel below a given velocity
            // while we are under floor
        if(
            acceleration < 0
        ){
            return velocity;
        }
        return velocity + acceleration;
    }
    // don't go below floor
    else if (
        velocity >= THRUST_FLOOR &&
        velocity + acceleration < THRUST_FLOOR
    ){
        return THRUST_FLOOR;
    }
    // don't go above ceiling
    else if (velocity + acceleration > THRUST_CEIL){
        return THRUST_CEIL;
    }

}

// center transformation and rotation checks on alternate frames
export function transformShipCenter (position: ShipPosition, movement: ShipMovement): ShipPosition {
    // rotation at thrust determines the angle towards which the ship moves
        // we only want to update this when user is not rotating, but is thrusting (increasing accel).
        // This will allow player to spin around while they fly forward.
    if(
        movement.keyStateTbl[CTRL_KEYCODES['thrust']] &&
        !movement.keyStateTbl[CTRL_KEYCODES['rotate-left']] &&
        !movement.keyStateTbl[CTRL_KEYCODES['rotate-right']]
    ) {
        position.rotationAtThrust = movement.shipRotation;
    }
    // if position.center x or y are out of bounds, convert center to
        // bounds-wrapped center coords
    if( !objInBounds(position.center, position.boundsMax) ){
        position.center = objWrapBounds(position.center, position.boundsMax);
    }
    position.center.x += movement.shipThrust * Math.sin(position.rotationAtThrust);
    position.center.y += -movement.shipThrust * Math.cos(position.rotationAtThrust);
    position.rotation = movement.shipRotation;

    return position;
}

// filter out out-of-bounds missile;
    //map missiles to MissileTransform;
    // add any new missile to missiles.
export function missileMapScan(mState: MState, latestLaunch: Launch): MState{
    let newMState = mState;
    // transform (move) each missile in collection
        // then filter those missiles, weeding out any that
        // have left canvas bounds.
    newMState.missiles = newMState.missiles.map(
        missile => missileTransform(missile)
    ).filter(transformedMissile => 
        objInBounds(transformedMissile.pos, mState.boundsMax)
    );
    // if the launch number of the latest missile is greater than
        // the missile number (mNum)
    if (latestLaunch.launchNum > mState.mNum){
        newMState.mNum = latestLaunch.launchNum;
        newMState.missiles.push(
            <Missile>{
                pos: {
                    x: latestLaunch.missileStart.x,
                    y: latestLaunch.missileStart.y
                },
                firingAngle: latestLaunch.missileAngle
            }
        );
    }
    return newMState;
}

// generate 4 starting asteroids:
    // we need to generate center coords for each asteroid
    // as well as angle of drift for each asteroid
export function generateAsteroid(canvas: HTMLCanvasElement){
    //let asteroids = Array<Asteroid>(4);
    let asteroids: Asteroid[] = [
        <Asteroid>{}, <Asteroid>{}, <Asteroid>{}, <Asteroid>{}
    ];
    let newAsteroids = asteroids.map((asteroid: Asteroid, index): Asteroid => {
        // asteroids generate at random position within the 4 gutters of the
            // canvas: the area within asteroid radius of 4 canvas edges.
            // we use radius, so that we can generate asteroids partially
            // off screen, per arcade original.
        asteroid.center = assignToGutter(index, canvas);
        // we set driftAngle as one of four angles:
            // 45deg, 135deg, 225deg, 315deg - but in radians
        asteroid.driftAngle = asteroidAngleOfFour(randomOfFour());
        asteroid.boundsMax = {
            x: canvas.width,
            y: canvas.height
        }
        // we'll have four different asteroid outline shapes,
            // so assign a random outline type
        asteroid.outlineType = asteroidShapeOfFour(randomOfFour());
        return asteroid;
    });
    return newAsteroids;
}

export function transformAsteroids(asteroids: Asteroid[]){
    return asteroids.map((asteroid: Asteroid): Asteroid => {
        if ( !objInBounds(asteroid.center, asteroid.boundsMax) ){
            asteroid.center = objWrapBounds(asteroid.center, asteroid.boundsMax);
        }
        asteroid.center.x += ASTEROID_SPD * Math.sin(asteroid.driftAngle);
        asteroid.center.y -= ASTEROID_SPD * Math.cos(asteroid.driftAngle);
        return asteroid;
    });
}

function missileTransform(missile: Missile) {
    missile.pos = {
        x: missile.pos.x += MISSILE_SPD * Math.sin(missile.firingAngle),
        y: missile.pos.y += -MISSILE_SPD * Math.cos(missile.firingAngle)
    };
    return missile;
}

function objInBounds(pos: Point2d, boundsMax: Point2d) {
    if(
        pos.x > 0 && pos.x < boundsMax.x &&
        pos.y > 0 && pos.y < boundsMax.y
    ){
        return true;
    }
}

function objWrapBounds(exit: Point2d, max: Point2d) {
    // define from which axis the ship has gone out of bounds
    let axes = max.x > exit.x && exit.x > 0 ?
    {outOfBAxis: 'y', inBAxis: 'x'} :
    {outOfBAxis: 'x', inBAxis: 'y'};
    return getReentryCoords(axes.outOfBAxis, axes.inBAxis, max, exit);
}

function getReentryCoords(outOfBAxis, inBAxis, bounds: Point2d, exitCoords: Point2d): Point2d{
    let reentryCoords = <Point2d>{};
    // the reentry value for the axis the ship went out of bounds
        // from will either equal 0 or the edge of that axis, depending
        // on whether the ship left at the highest edge, or at 0
    reentryCoords[outOfBAxis] = exitCoords[outOfBAxis] >= bounds[outOfBAxis] ? 0 : bounds[outOfBAxis];
    // the reentry value of the axis by which the ship is still in bounds
        // will be preserved on reentry
    reentryCoords[inBAxis] = exitCoords[inBAxis];
    return reentryCoords;
}

function assignToGutter(index, canvas: HTMLCanvasElement): Point2d {
    // based on index num, provide floor and ceil for given gutter
    let floor = <Point2d>{}, ceiling = <Point2d>{};
    // We assign gutters to asteroids in clockwise order, starting at the upper gutter
    if(index === 0) {
        floor.y = 0, ceiling.y = ASTEROID_RADIUS;
        floor.x = 0, ceiling.x = canvas.width;
    } else if (index === 1) {
        floor.y = 0, ceiling.y = canvas.height;
        floor.x = canvas.width - ASTEROID_RADIUS, ceiling.x = canvas.width;
    } else if (index === 2) {
        floor.y = canvas.height - ASTEROID_RADIUS, ceiling.y = canvas.height;
        floor.x = 0, ceiling.x = canvas.width;
    } else {
        floor.y = 0, floor.y = 0, ceiling.y = canvas.height;
        floor.x = 0, ceiling.x = ASTEROID_RADIUS;
    }
    return randomCoords(floor, ceiling);
}

function randomCoords(floor: Point2d, ceiling: Point2d): Point2d {
    // inclusive floor and ceiling when randomizing
    return {
        x: Math.floor(Math.random() * (ceiling.x - floor.x + 1) + floor.x),
        y: Math.floor(Math.random() * (ceiling.y - floor.y + 1) + floor.y)
    }
}

function randomOfFour(){
    // janky randomization method
    const seed = Math.random();
    if(seed > 0 && seed < 0.3){
        return 1;
    }else if(seed > 0.2 && seed < 0.5){
        return 2;
    }else if(seed > 0.4 && seed < 0.7){
        return 3;
    } else if(seed > 0.6 && seed < 0.9){
        return 4;
    } else{
        return randomOfFour();
    }
}

function asteroidAngleOfFour(seed: 1 | 2 | 3 | 4){
    if(seed === 1){
        // 45deg to rad
        return Math.PI/4;
    }else if(seed === 2){
        // 135deg to rad
        return 7 * Math.PI/4;
    }else if(seed === 3){
        // 225deg to rad
        return 5 * Math.PI/4;
    } else if(seed === 4){
        // 315deg to rad
        return 3 * Math.PI/4;
    }
}

function asteroidShapeOfFour(seed: 1 | 2 | 3 | 4) {
    if(seed === 1){
        // 45deg to rad
        return 'A';
    }else if(seed === 2){
        // 135deg to rad
        return 'B';
    }else if(seed === 3){
        // 225deg to rad
        return 'C';
    } else if(seed === 4){
        // 315deg to rad
        return 'D';
    }
}

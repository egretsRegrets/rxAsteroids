
import {
    Point2d,
    AngularDisplacement,
    ShipPosition,
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
    THRUST_ACCEL,
    THRUST_DECEL,
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

// center transformation and rotation checks on alternate frames
export function transformShipPos (position: ShipPosition, movement: ShipMovement): ShipPosition {
    // suppress thrust input if we're turning:
    if(
        movement.keyStateTbl[CTRL_KEYCODES['thrust']]
    ) {
        position.rotationAtThrust = movement.shipRotation;
        // if there is no accel in direction of the current angle,
            // add the angle to the angularDisplacementTbl with velocity of zero
        if ( 
            !position.angularDisplacementTbl.filter(cell => 
                cell.angle === movement.shipRotation
            ).length
        ){
            position.angularDisplacementTbl.push(
                {
                    angle: movement.shipRotation,
                    velocity: 0
                }
            );
        }
    }
    // if position.center x or y are out of bounds, convert center to
        // bounds-wrapped center coords
    if( !objInBounds(position.center, position.boundsMax) ){
        position.center = objWrapBounds(position.center, position.boundsMax);
    }
    position.angularDisplacementTbl = position.angularDisplacementTbl
        // filter out angleDisplacement where the velocity is === thrust floor,
            // unless that's the direction we're moving toward, thus we
            // remove any angularDisplacement cell where there is no velocity in that direction
        .filter(
            (angularDisplacement: AngularDisplacement) =>
            {
                if(
                    (position.rotationAtThrust * 180/Math.PI) === (angularDisplacement.angle * 180/Math.PI) ||
                    angularDisplacement.velocity > THRUST_FLOOR
                ){
                    return angularDisplacement;
                }
            }
        )
        .map((angularDisplacement: AngularDisplacement) => {
            // if the new ship rotation is equal to this angle and the user is
                // accelerating then we increase this velocity
            if(
                (position.rotationAtThrust * 180/Math.PI) === (angularDisplacement.angle * 180/Math.PI) &&
                movement.keyStateTbl[CTRL_KEYCODES['thrust']]
            ){
                // get the total ship velocity, for purposes of keeping under ceiling
                let shipVelocity = position.angularDisplacementTbl.reduce((totalVel, angDCell: AngularDisplacement) => 
                    totalVel + angDCell.velocity
                , 0);
                angularDisplacement.velocity = resolveVelocity(angularDisplacement.velocity, 'pos', shipVelocity);
            } else{
                angularDisplacement.velocity = resolveVelocity(angularDisplacement.velocity, 'neg');
            }
            return angularDisplacement;
        });
    position.center.x += resolveShipCenter(position.angularDisplacementTbl, 'x');
    position.center.y += -resolveShipCenter(position.angularDisplacementTbl, 'y');
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

function resolveVelocity(velocity: number, accelType: 'pos' | 'neg', totalVel: number = null ) {
    if(accelType === 'pos'){
        // keep this velocity at this angle from putting the whole
            // ship velocity above the ceiling
        if(velocity + THRUST_ACCEL + totalVel >= THRUST_CEIL){
            return velocity;
        }
        // keep velocity under thrust ceiling at this angle
        if(velocity + THRUST_ACCEL >= THRUST_CEIL){
            return THRUST_CEIL;
        }
        // if everything's under ceiling, accel
        return velocity + THRUST_ACCEL;
    } else{
        // keep velocity above thrust floor
        if(velocity - THRUST_DECEL <= THRUST_FLOOR){
            return THRUST_FLOOR;
        }
        // decel by decel rate
        return velocity - THRUST_DECEL;
    }
    
}

function resolveShipCenter(angularDisplacementTbl: AngularDisplacement[], axis: 'x' | 'y') {
    return angularDisplacementTbl.reduce((accDis, displacementCell: AngularDisplacement) => {
        let displacement;
        if(axis === 'x'){
            displacement = displacementCell.velocity * Math.sin(displacementCell.angle);
        } else{
            displacement = displacementCell.velocity * Math.cos(displacementCell.angle);
        }
        return accDis + displacement;
    }, 0)
}

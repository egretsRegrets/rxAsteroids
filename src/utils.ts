
import {
    ShipPosition,
    Point2d,
    ShipMovement,
    Launch,
    Missile,
    MState
} from './interfaces';
import {
    THRUST_SPD,
    THRUST_CEIL,
    THRUST_FLOOR,
    MISSILE_SPD
} from './consts';

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / THRUST_SPD
    : angle += (Math.PI / 3) / THRUST_SPD;
}

export function resolveThrust(velocity, acceleration) {
    // allow accelerate up to THRUST_CEIL and as low as 0
    return (velocity + acceleration) <= THRUST_CEIL &&
    (velocity + acceleration) >= THRUST_FLOOR ?
    velocity + acceleration :
    velocity;

}

// center transformation and rotation checks on alternate frames
export function transformShipCenter (position: ShipPosition, movement: ShipMovement): ShipPosition {
    if(movement.pilotInput === 'thrust' && position.rotationAtThrust !== movement.shipRotation) {
        // if the last pilotInput was thrust, and current rotation isn't the same
            // as the last recorded rotation-at-thrust
                // then rotationAtThrust is equal to the current rotation
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


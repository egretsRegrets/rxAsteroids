
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
    /**
     * add filter for in-bounds here
     */
    // transform (move) each missile in collection
    newMState.missiles = newMState.missiles.map(
        missile => missileTransform(missile)
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

function missileInBounds() {}

function missileTransform(missile: Missile) {
    missile.pos = {
        x: missile.pos.x += MISSILE_SPD * Math.sin(missile.firingAngle),
        y: missile.pos.y += -MISSILE_SPD * Math.cos(missile.firingAngle)
    };
    return missile;
}

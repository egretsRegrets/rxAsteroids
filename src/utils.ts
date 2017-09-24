
import { ShipPosition, Ship, Point2d, ShipMovement } from './interfaces';
import { THRUST_SPD, THRUST_CEIL } from './consts';

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / THRUST_SPD
    : angle += (Math.PI / 3) / THRUST_SPD;
}

export function resolveThrust(velocity, acceleration) {
    // allow accelerate up to THRUST_CEIL and as low as 0
    return (velocity + acceleration) <= THRUST_CEIL &&
    (velocity + acceleration) > 0 ?
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

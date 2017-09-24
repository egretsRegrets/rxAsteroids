
import { ShipPosition, Ship, Point2d } from './interfaces';
import { THRUST_SPD, THRUST_CEIL } from './consts';

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / THRUST_SPD
    : angle += (Math.PI / 3) / THRUST_SPD;
}

export function resolveThrust(velocity, acceleration) {
    // allow accelerate up to THRUST_CEIL and as low as 0
    return (velocity + acceleration) <= THRUST_CEIL &&
    (velocity + acceleration) >= 0 ?
    velocity += acceleration :
    velocity;
}

// center transformation and rotation checks on alternate frames
export function transformShipCenter (position: ShipPosition, movement): ShipPosition {
    if (movement.inputType === 'thrust'){
        position.center.x += movement.shipThrust * Math.sin(movement.shipRotation);
        position.center.y += -movement.shipThrust * Math.cos(movement.shipRotation);
    }
    else {
        position.rotation = movement.shipRotation;
    }
    return position;
}

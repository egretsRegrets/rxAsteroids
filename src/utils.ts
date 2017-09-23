
import { ShipPosition, Ship, Point2d } from './interfaces';
import { THRUST_SPD } from './consts';

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / THRUST_SPD
    : angle += (Math.PI / 3) / THRUST_SPD;
}

export function resolveThrust(thrust, accel) {
    return THRUST_SPD;
}

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
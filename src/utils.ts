
import { ShipPosition, Ship, Point2d } from './interfaces';
import { THRUST_SPD } from './consts';

export function rotateShip(angle, rotation) {
    return rotation === 'rotate-left'
    ? angle -= (Math.PI / 3) / 10
    : angle += (Math.PI / 3) / 10;
}

export function resolveThrust(thrust, accel) {
    return THRUST_SPD;
}

export function transformShipCenter (position: ShipPosition, movement): ShipPosition {
    return {
        center: {
            x: position.center.x += movement.shipThrust * Math.sin(movement.shipRotation),
            y: position.center.y += -movement.shipThrust * Math.cos(movement.shipRotation)
        },
        rotation: movement.shipRotation
    };
}
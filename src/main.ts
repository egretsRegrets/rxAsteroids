
// RxJS imports
import { Observable } from 'rxjs/Observable';
import { animationFrame} from 'rxjs/scheduler/animationFrame';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';

import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/withLatestFrom';

// same-dir imports
import { 
    rotateShip,
    resolveThrust,
    transformShipCenter
} from './utils';
import { renderScene } from './canvas';
import { FPS, CONTROLS, THRUST_SPD } from './consts';
import { ShipPosition, Ship, Point2d} from './interfaces';

// create, append canvas
let canvas = <HTMLCanvasElement>document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
canvas.setAttribute("id", "asteroids_canvas");
document.body.appendChild(canvas);

/**
 * we want to be able to have a ticks to throttle 
 * user actions on ship.
 * test for right speed
 */
let shipTicks$: Observable<number> = Observable
    .interval( 1000 / (FPS / 1.5), animationFrame);

// keydown source stream
let keydown$: Observable<KeyboardEvent> = Observable
    .fromEvent(document, 'keydown');

// pipeline - user input to ship model 

// filter only those keyboard inputs we're looking for
let pilotInput$: Observable<string> = keydown$
    .map((event: KeyboardEvent) => CONTROLS[event.keyCode])
    .filter(control => !!control);

/**
 * ship.fire should only be true when space is depressed,
 * otherwise, ship.fire should be false
 */
let shipFire$: Observable<boolean> = pilotInput$
    .filter(input => input === 'fire')
    .map(fired => true)
    .startWith(false);

// ship rotation changes angle in rad based on left, right keys
let shipRotation$: Observable<number> = pilotInput$
    .filter(input => input === 'rotate-left' || input === 'rotate-right')
    .scan(rotateShip, 0)
    .startWith(0);

// pressing the thruster key
    // to start acceleration
let accel$: Observable<number> = Observable
    .fromEvent(document, 'keydown')
    .map((event: KeyboardEvent) => CONTROLS[event.keyCode])
    .filter(control => control === 'thrust')
    .map(accelInput => 1)
    .throttle(val => Observable.interval(1000 / (FPS / 2), animationFrame));
    

// letting off thruster key
    // to trigger deceleration
let decel$ = Observable
    .fromEvent(document, 'keyup')
    .map((event: KeyboardEvent) => CONTROLS[event.keyCode])
    .filter(control => control === 'thrust')
    .switchMap( () => Observable
        .interval(1000 / (FPS / 2), animationFrame)
        .map(tick => -.7)
        .takeUntil(accel$)
    );

/**
 * thrust should model acceleration as an integer
 * increasing as the up arrow key is held over time,
 * decreasing for the amount of time it is not depressed,
 * until it reaches 0, which is also its starting point
 */
let shipThrust$: Observable<number> = Observable
    .merge(accel$, decel$)
    .scan(resolveThrust)
    .startWith(0)
    .distinctUntilChanged();

/**
 * TODO:
 * change shipPos and ship, so that shipPos, checks
 * position at each shipTick$[],
 * and ship just checks for ship fire at each emission of shipPos
 * and then combines them.
 * currently we aren't truly modeling ship pos through time,
 * but only getting new snapshots on pilot input: this is a bad idea
 */

/**
 * keep track of center of ship
 * drawing context, eventually to be acted
 * on by shipThrust
 * REMEMBER WE NEED ACCESS TO shipRotation$
 */
let shipPos$: Observable<ShipPosition> =
    /**
     * if rotating and not thrusting,
     * we don't want to alter center points
     */
    pilotInput$
    .filter(input => input !== 'fire')
    .combineLatest(shipThrust$, shipRotation$, (inputType, shipThrust, shipRotation) => ({inputType, shipThrust, shipRotation}))
    .scan(transformShipCenter, {
        center: {
            x: canvas.width / 2,
            y: canvas.height / 2
        },
        rotation: 0
    })
    // we sample an input, so we need starting vals to project
        // to initial render
    .startWith(
        {
            center: {
                x: canvas.width / 2,
                y: canvas.height / 2
            },
            rotation: 0
        }
    );

/**
 * here we need a way to only take a snap shot of the
 * ship model when one of it's properties is changed,
 * that is - anytime it fires, experiences a change in rotation or thrust
 */
let ship$: Observable<Ship> = shipTicks$
    .combineLatest(
        shipPos$, shipFire$,
        (_, shipPos, shipFire) => ({
            rotation: shipPos.rotation,
            center: shipPos.center,
            fire: shipFire
        })
    )

/**
 * scene observable to combine all of the observables
 * we want to expose to the scene rendering game observable
 */

let scene$: Observable<Ship> = ship$
    // need to merge with other observables - asteroids, scour
        // and produce object w/ prop for each observe
    .merge();

/**
 * game observable to project to
 * rendering function at fps interval
 */
let game$ = Observable
    .interval(1000 / FPS, animationFrame)
    .withLatestFrom(scene$, (_, scene) => scene)
    .map(scene => (
        {
            ship: {
                rotation: scene.rotation,
                center: scene.center,
                fire: scene.fire
            }
        }
    )
    ).subscribe({
        next: scene => renderScene(canvas, ctx, scene) 
    });
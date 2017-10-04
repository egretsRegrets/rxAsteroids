
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
    transformShipCenter,
    missileMapScan,
    mapKeysDown,
    generateAsteroid,
    transformAsteroids
} from './utils';
import { renderScene } from './canvas';
import { FPS, CONTROLS, THRUST_SPD, CTRL_KEYCODES } from './consts';
import { 
    ShipPosition,
    Point2d,
    ShipMovement,
    PilotInput,
    Scene,
    Launch,
    Missile,
    MState,
    KeysDown,
    Asteroid
} from './interfaces';

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

// keydown source stream
let keydown$ = Observable.fromEvent(document, 'keydown');
let keyup$ = Observable.fromEvent(document, 'keyup');

// keep a table/obj of keystate, will change whenever a key is lifted,
    // or pressed from lifted. This allows us to have multiple keys pressed
    // simultaneously.
let keyStateTbl$ = keydown$.merge(keyup$)
    .filter((evt: KeyboardEvent) => CONTROLS[evt.keyCode] !== undefined)
    .scan(mapKeysDown, <KeysDown>{})
    .startWith(
        {
            38: false,
            37: false,
            39: false,
            32: false
        });

// ship rotation changes angle in rad based on left, right keys
let shipRotation$: Observable<number> = 
    /*
    pilotInput$
    .filter(input => input === 'rotate-left' || input === 'rotate-right')
    */
    keyStateTbl$
    .filter(table => 
        table[CTRL_KEYCODES['rotate-left']] ||
        table[CTRL_KEYCODES['rotate-right']]
    )
    .map(tbl => 
        tbl[CTRL_KEYCODES['rotate-left']] ?
        'rotate-left' :
        'rotate-right'
    )
    .scan(rotateShip, 0)
    .startWith(0);

// pressing the thruster key
    // to start acceleration
let accel$: Observable<number> = Observable
    .fromEvent(document, 'keydown')
    .map((event: KeyboardEvent) => CONTROLS[event.keyCode])
    .filter(control => control === 'thrust')
    .map(accelInput => .25)
    .throttle(val => Observable.interval(50));
    

// letting off thruster key
    // to trigger deceleration
/**
 * let's think about throttling decel, so that decel doesn't start
 * right away
 */
let decel$: Observable<number> = Observable
    .fromEvent(document, 'keyup')
    .map((event: KeyboardEvent) => CONTROLS[event.keyCode])
    .filter(control => control === 'thrust')
    // we create a stream from each keyup event
        // this stream delivers a decel tick to shipThrust every
        // 300ms, or until accel occurs again.
        // switchMap only keeps track of vals from the latest innner observable,
        // the latest decrement countdown
    .switchMap( () => Observable
        .interval(300)
        .map(tick => -.25)
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

// shipPos$ will keep track of the center of the ship, as well as its rotation,
    // an angle in radians. We also want to store rotation at the time of the 
    // last increase in thrust - this helps us maintain velocity in the direction
    // of a given thrust, even if the ship turns along the way.
let shipPos$: Observable<ShipPosition> =
    // note that, in order to render scene prior to input, by the first
            // interval either all combined Observables need to have emitted
            // a value, or shipPos$ needs to start with a val. we opt for the
            // first option here; all input observables have startWith(<val>).
    Observable.interval(1000 / FPS, animationFrame)
    .combineLatest( keyStateTbl$, shipThrust$, shipRotation$,
        (_, keyStateTbl, shipThrust, shipRotation) =>
        (<ShipMovement>{ keyStateTbl, shipThrust, shipRotation})
    )
    .scan(transformShipCenter, <ShipPosition>{
        center: {
            x: canvas.width / 2,
            y: canvas.height / 2
        },
        rotation: 0,
        rotationAtThrust: 0,
        boundsMax: {x: canvas.width, y: canvas.height}
    });

// shipFire$ needs to track the fire key - which will trigger the emission
    // of a new projectile. Each projectile emitted needs to keep track of 
    // a Point2d equal to the center prop of latest shipPos$ emission at time
    // of shipFire$ input - these coords to be transformed into the starting
    // point of the projectile. We also need to keep track of shipPos$ rotation prop
    // at fire, so we can continue to move the projectiles at the angle from which
    // they were fired.
let shipFire$: Observable<Launch> = 
    /*
    pilotInput$
    .filter(input => input === 'fire')
    */
    keyStateTbl$
    .filter( table => table[CTRL_KEYCODES['fire']] )
    .map(tbl => tbl[CTRL_KEYCODES['fire']])
    // update the number of missiles launched / the launch number of the new missile
    .scan((missilesLaunched) => missilesLaunched + 1, 0)
    .withLatestFrom(
        shipPos$,
        (launchNum, shipPos) => ({
            missileStart: shipPos.center,
            missileAngle: shipPos.rotation,
            launchNum
        })
    )
    .throttle(launch => Observable.interval(300));

// These are player shots, a new one will be added with each emission from
    // shipFire$ and then will cease to be tracked when it strikes canvas bounds
let playerProjectile$: Observable<Missile[]> = Observable
    .interval( 1000 / FPS, animationFrame )
    .withLatestFrom(shipFire$, (_, shipFires: Launch) => shipFires)
    // We return a collection of missiles at every frame. missileMapScan
        // filters the collection to those still in the canvas bounds, and
        // maps over the collection to transform each missile position.
        // Finally it adds any new missile to the collection
    .scan(missileMapScan, <MState>{
        missiles: <Missile[]>[],
        mNum: 0,
        boundsMax: {x: canvas.width, y: canvas.height}
    })
    // only emit the missiles collection
    .map(missileState => missileState.missiles)
    .startWith([]);

/**
 * Asteroids$ observable to model antagonist asteroids.
 * Should return a collection representing center coords for each
 * asteroid, as well as angle-of-travel and velocity for each asteroid.
 * Velocity/angle will be randomly generated as each asteroid is created. 
 */
let asteroids$: Observable<Asteroid[]> = Observable
    .interval(1000 / FPS, animationFrame)
    .scan(transformAsteroids, generateAsteroid(canvas));

// scene observable to combine all of the observables
    // we want to expose to the scene rendering game observable
 
let scene$: Observable<Scene> = shipPos$
    // need to merge with other observables - asteroids, score
        // and produce object w/ prop for each observe
    .withLatestFrom(
        playerProjectile$, asteroids$,
        (ship: ShipPosition, missiles: Missile[], asteroids: Asteroid[]) => (<Scene>{
            ship,
            missiles,
            asteroids
        })
    );

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
                rotation: scene.ship.rotation,
                center: scene.ship.center
            },
            missiles: scene.missiles,
            asteroids: scene.asteroids
        }
    )
    ).subscribe({
        next: scene => renderScene(canvas, ctx, scene) 
    });

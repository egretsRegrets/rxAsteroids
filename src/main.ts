
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
    transformShipPos,
    missileMapScan,
    mapKeysDown,
    generateSeedProjectiles,
    transformEntities,
    asteroidMissileCollision
} from './utils';
import { renderScene } from './canvas';
import { FPS, CONTROLS, 
    ROTATION_INCREMENT, 
    CTRL_KEYCODES
 } from './consts';
import { 
    AngularDisplacement,
    ShipPosition,
    Point2d,
    ShipMovement,
    PilotInput,
    Scene,
    Launch,
    Missile,
    MState,
    KeysDown,
    Asteroid,
    ProjectileEntities
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
    .combineLatest( keyStateTbl$, shipRotation$,
        (_, keyStateTbl, shipRotation) =>
        (<ShipMovement>{ keyStateTbl, shipRotation})
    )
    .scan(transformShipPos, <ShipPosition>{
        center: {
            x: canvas.width / 2,
            y: canvas.height / 2
        },
        rotation: 0,
        rotationAtThrust: 0,
        boundsMax: {x: canvas.width, y: canvas.height},
        angularDisplacementTbl: []
    });

// shipFire$ needs to track the fire key - which will trigger the emission
    // of a new projectile. Each projectile emitted needs to keep track of 
    // a Point2d equal to the center prop of latest shipPos$ emission at time
    // of shipFire$ input - these coords to be transformed into the starting
    // point of the projectile. We also need to keep track of shipPos$ rotation prop
    // at fire, so we can continue to move the projectiles at the angle from which
    // they were fired.
let shipFire$: Observable<Launch> = Observable
    .interval(1000 / FPS, animationFrame)
    .withLatestFrom(keyStateTbl$, (_, keyStateTbl) => keyStateTbl)
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
    .throttle(launch => Observable.interval(200))
    .startWith(
        {
            missileStart: null,
            missileAngle: null,
            launchNum: 0
        }
    );

// projectileEntities is our big fat bottle neck observable
    // it's messy but it returns an object of type ProjectileEntity that contains
    // the info we use to render asteroids and missiles. 
    // Internally it does a great deal of work. It uses the launch output of
    // shipFire$ to create missiles; it also generates asteroids and hands both
    // asteroids and missiles off to functions that test for collisions and transforms
    // these projectile types accordingly.
let projectileEntities$: Observable<ProjectileEntities> = Observable
    .interval(1000 / FPS, animationFrame)
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
    .scan(
        (entities, missiles) => transformEntities(entities, missiles),
        generateSeedProjectiles(canvas)
    );

// scene observable to combine all of the observables
    // we want to expose to the scene rendering game observable
 
let scene$: Observable<Scene> = shipPos$
    // need to merge with other observables - asteroids, score
        // and produce object w/ prop for each observe
    .withLatestFrom(
        projectileEntities$,
        (ship: ShipPosition, projectiles: ProjectileEntities) => (<Scene>{
            ship,
            missiles: projectiles.missiles,
            asteroids: projectiles.asteroids
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

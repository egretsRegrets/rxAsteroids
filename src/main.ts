
// RxJS imports
import { Observable } from 'rxjs/Observable';
import { animationFrame} from 'rxjs/scheduler/animationFrame';

import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';

import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/withLatestFrom';

// same-dir imports
import { generateCanvas, rotateShip, resolveThrust } from './utils';
import { createCanvasElement, renderScene } from './canvas';
import { FPS, CONTROLS } from './consts';
import { Ship } from './interfaces';

// create, append canvas
//let canvasObj = generateCanvas();
// on resize recreate canvas
let resize$ = Observable.fromEvent(window, 'resize')
    .forEach(() => /*canvasObj = */generateCanvas());

/**
 * we want to be able to have a ticks to throttle 
 * user actions on ship.
 * test for right speed
 */
let shipTicks$ = Observable
    .interval( 1000 / (FPS / 2), animationFrame);

// keydown source stream
let keydown$ = Observable.fromEvent(document, 'keydown');

// pipeline - user input to ship model 

// filter only those keyboard inputs we're looking for
let pilotInput$ = keydown$
    .map((event: KeyboardEvent) => CONTROLS[event.keyCode])
    .filter(control => !!control);

// ship rotation changes angle in rad based on left, right keys
let shipRotation$ = pilotInput$
    .filter(input => input === 'rotate-left' || input === 'rotate-right')
    .scan(rotateShip, 0)
    .startWith(0);

/**
 * thrust should model acceleration as an integer
 * increasing as the up arrow key is held over time,
 * decreasing for the amount of time it is not depressed,
 * until it reaches 0, which is also its starting point
 */
let shipThrust$ = pilotInput$
    .filter(input => input === 'thrust')
    .scan(resolveThrust, 0)
    .startWith(0);

/**
 * ship.fire should only be true when space is depressed,
 * otherwise, ship.fire should be false
 */
let shipFire$ = pilotInput$
    .filter(input => input === 'fire')
    .map(fired => true)
    .startWith(false);


/**
 * here we need a way to only take a snap shot of the
 * ship model when one of it's properties is changed,
 * that is - anytime it fires, experiences a change in rotation or thrust
 */
let ship$ = shipTicks$
    .combineLatest(shipRotation$, shipThrust$, shipFire$,
        (_, rotation, thrust, fire) => ({rotation, thrust, fire})
    );

/**
 * scene observable to combine all of the observables
 * we want to expose to the scene rendering game observable
 */

let scene$ = ship$
    // need to merge with other observables - asteroids, scour
        // and produce object w/ prop for each observe
    .merge();

/**
 * game observable to project to
 * rendering function at fps interval
 */

let game$ = Observable
    .interval(1000 / FPS, animationFrame)
    .withLatestFrom(scene$)
    .subscribe({
        next: (scene) => renderScene(generateCanvas(), scene)
    });
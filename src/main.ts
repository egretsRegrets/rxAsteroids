
// RxJS imports
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

// same-dir imports
import { generateAsteroid, generateCanvas } from './utils';
import { createCanvasElement } from './canvas';

// create, append canvas
let canvas, ctx;
generateCanvas(canvas, ctx);

// on resize recreate canvas
let resize$ = Observable.fromEvent(window, 'resize');
resize$.forEach(() => generateCanvas(canvas, ctx));

// keydown source stream
let keydown$ = Observable.fromEvent(document, 'keydown');

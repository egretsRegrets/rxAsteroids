
// RxJS imports
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

// same-dir imports
import { generateAsteroid } from './utils';

let keydown$ = Observable.fromEvent(document, 'keydown');

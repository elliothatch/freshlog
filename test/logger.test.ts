import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Logger, Middleware, Target } from '../src';

//TODO: test adding new level, custom middleware
let logs: string[] = [];
const target = {
    name: 'test', write: (serializedData: string) => {
        logs.push(serializedData);
    }
};

beforeEach(() => {
    logs = [];
});

test('log message', () => {
    const logger = new Logger({target, middleware: []});
    logger.info('hello');
    expect(logs.length).toBe(1);
    expect(JSON.parse(logs[0])).toEqual({level: 'info', message: 'hello'});
});

test('log messages at all levels', () => {
    const logger = new Logger({target, middleware: []});
    for (const item of logger.handlers) {
        item[1].enabled = true;
    }

    logger.diag('diagMessage', {cpu: 100});
    logger.trace('traceMessage', {type: 'a'});
    logger.info('infoMessage', {data: ['a', 2]});
    logger.warn('warnMessage', {a: {b: {c: 'c'}}});
    logger.error('errorMessage');
    logger.fatal('fatalMessage');

    expect(logs.length).toBe(6);

    const data = logs.map((d) => JSON.parse(d));

    expect(data[0]).toEqual({level: 'diag', message: 'diagMessage', cpu: 100});
    expect(data[1]).toEqual({level: 'trace', message: 'traceMessage', type: 'a'});
    expect(data[2]).toEqual({level: 'info', message: 'infoMessage', data: ['a', 2]});
    expect(data[3]).toEqual({level: 'warn', message: 'warnMessage', a: {b: {c: 'c'}}});
    expect(data[4]).toEqual({level: 'error', message: 'errorMessage'});
    expect(data[5]).toEqual({level: 'fatal', message: 'fatalMessage'});
});

describe('middleware', () => {
    test('timestamp', () => {
        const logger = new Logger({target, middleware: [{mw: Middleware.timestamp, levels: true}]});

        logger.info('a');

        expect(logs.length).toBe(1);
        expect(JSON.parse(logs[0]).timestamp).toBeDefined();
        // TODO: check that it's an ISO string
    });

    test('fullError', () => {
        const logger = new Logger({target, middleware: [{mw: Middleware.error, levels: true}]});

        logger.info('a', {error: new Error('broken')});

        expect(logs.length).toBe(1);
        const data = JSON.parse(logs[0]);
        expect(data).toMatchObject({level: 'info', message: 'a', error: {message: 'broken'}});
        expect(data.error.stack).toBeDefined();
    });
});

describe('target', () => {
    describe('observable', () => {
        test('notifies observable', (done) => {
            const {observable, target} = Target.Observable('test observable');
            const logger = new Logger({target, middleware: []});

            logger.info('a');

            const result = observable.subscribe({
                next: ((data) => {
                    // only expect log after we've subscribed
                    expect(JSON.parse(data)).toEqual({level: 'info', message: 'b'});
                    done();
                }),
                error: (error) => done(error)
            });

            logger.info('b');
        });

        test('supports custom subject', (done) => {
            const {observable, target} = Target.Observable('test replay observable', new ReplaySubject());
            const logger = new Logger({target, middleware: []});

            logger.info('a');

            let i = 0;
            const result = observable.subscribe({
                next: ((data) => {
                    if(i === 0) {
                        expect(JSON.parse(data)).toEqual({level: 'info', message: 'a'});
                    }
                    else {
                        expect(JSON.parse(data)).toEqual({level: 'info', message: 'b'});
                        done();
                    }
                    i++;
                }),
                error: (error) => done(error)
            });

            logger.info('b');
        });
    });
});

# freshlog
simple nodejs logger

Log levels
```
* fatal   | unrecoverable error
* error   | unhandled error
* warn    | warning
* info    | startup status and notable events
  request | http and ws requests
  trace   | operational logging
  telem   | telemetry - performance and timing data
  diag    | system diagnostic info

*Enabled by default
```

# Install
```javascript
npm install freshlog
```

# Usage
```javascript
import { Log, Logger } from 'freshlog';

Log.info('start-server', {port: 8080});
// {"level": "info", "message": "start-server", "port": 8080, timestamp: "2018-09-15T08:27:32.465Z"}

// enable/disable log output
Log.handlers.get('diag').enabled = true;

// use middleware to add or modify data on each log
function pid(data) {
    data.pid = process.pid;
    return data;
}

// add middleware to all levels
Log.addMiddleware(pid, true);

// Add custom level
Log.addHandler('greetings', {
    middleware: [(data) => Object.assign(data, {message: message.toUpper(), greeter: 'elliot'})]
});

Log.log('greetings', 'hello');
// {"level": "greetings", "message": "Hello", "greeter": "elliot"}
```

# Development

## Build
```
yarn
yarn build
```

## Test
```
yarn test
```

## Publish
```
yarn version
yarn publish
```

## Generate Documentation
```
yarn docs
```

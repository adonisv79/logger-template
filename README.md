# logger-template
An abstract template meant as a base for any logging tool. 
This just contain a simple abstract class to be consumed to work in tandem with any logging mechanism such as winston, intel, etc. 
There are so many to use even for such a simple feature. 
This is for the sake of IOC where most of my projects will just require the developer to provide a logger of their own that inherots from this class. 
It would not matter what is running the logging mechanism behind it.

# How to use (Create you logger)
Lets use winston for example as this is one of the most useful logging module I have worked with.
```
npm i logger-template --save
npm i winston --save
```

Lets create our **logger.ts** file
```
import winston from 'winston';
import config from '../config';
import { LoggerTemplate, KeyValuePair } from 'logger-template';

const d = new Date();
const logFilePrefix = d.getUTCFullYear() + (`0${d.getUTCMonth() + 1}`).slice(-2) + (`0${d.getUTCDate()}`).slice(-2);

function createLogger(): winston.Logger {
  return winston.createLogger({
    level: config.server.logLevel,
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: `logs/${logFilePrefix}-error.log`, level: 'error' }),
      new winston.transports.File({ filename: `logs/${logFilePrefix}-combined.log` }),
      new winston.transports.Console({ format: winston.format.simple() }),
    ],
  });
}

const wlogger: winston.Logger = createLogger();

async function onCritical(message: string, data?: KeyValuePair<any> | Error): Promise<void> {
  await wlogger.crit(message, data);
  return true;
}

async function onError(message: string, data?: KeyValuePair<any> | Error): Promise<void> {
  await wlogger.info(message, data);
  return true;
}

async function onWarn(message: string, data?: KeyValuePair<any>): Promise<void> {
  await wlogger.warn(message, data);
  return true;
}


async function onInfo(message: string, data?: KeyValuePair<any>): Promise<void> {
  await wlogger.info(message, data);
  return true;
}


async function onDebug(message: string, data?: KeyValuePair<any>): Promise<void> {
  await wlogger.debug(message, data);
  return true;
}

// Create our class and map the log event functions thru its constructor
class Logger extends ExpressLogger {
  constructor() {
    super({
      onCritical,
      onError,
      onWarn,
      onInfo,
      onDebug,
    });
  }
}

const singleton = new Logger();
export default singleton;

```

You can now utilize the logger in your app as such
```
// assume this is your project file
import logger from './logger';

async function test() {
  try{
    logger.info('Test started');
    // do something
    if (somthingIsStrange === true) {
      logger.warn('something is strange...');
    }
    logger.info('Test completed');
  } catch (err) {
    logger.error(`We received an error: ${err.message}`);
  }
}

```

# Error Levens and Purpose
We only need 5 levels of error. Seriously! I have seen some logging tools where there are like 7 to 10 types wherein we do not actually need most of those deep level details. This 5 have everything covered as explained below
* crit (event = onCritical) - These are extreme types of errors. They are mostly unresolvable, unhandled or unexpected things that happened in your code that can mess up how your system works. Usually you would map a notification on this to alert/mail the administrator or developer so it can be resolved fast.
* error (event = onError) - These are standard errors that occur (most likely are expected). Example are runing a file search function where a file does not exists in the path, you throw an error which is expected.
* warn (event = onWarn) - Informational data that may need looking into. an example is disk running out, a connection to the database is lost, or a connection to a 3rd party API cannot be established suddenly where I.T. may need toifying to remedy the situation ASAP.
* info (event = onInfo) - Informational data that is not too sensitive but can help track what has happened (for debuging purposes)
* debug (event = onDebug) - [!WARN: THis only works where process.env.NODE_ENV !== 'production'] Very detailed data that helps developers understand what is happening in the app. This is not a log level meant to be shown in Production environments and will usually contain critical data like user inputs, database records, etc. which helps developers analyze code issues.
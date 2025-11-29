import {
  initLogger,
  Logger,
  ConsoleAdapter,
  LogLevel,
} from 'isomorphic-logger-ts';

const RUNTIME = typeof window !== 'undefined' ? 'client' : 'server';

initLogger([new ConsoleAdapter(LogLevel.Info)], RUNTIME);

Logger.info('Instrumentation initialized', {
  extra: {
    env: process.env.NODE_ENV,
    runtime: process.env.NEXT_RUNTIME,
  },
});

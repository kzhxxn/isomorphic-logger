import {
  initLogger,
  Logger,
  ConsoleAdapter,
  LogLevel,
} from 'isomorphic-logger-ts';

export const runtime = 'edge';
export async function GET() {
  const isEdge = process.env.NEXT_RUNTIME === 'edge';

  Logger.info('Edge API Route에서 실행됨', {
    isEdge,
    env: process.env.NODE_ENV,
    nextRuntime: process.env.NEXT_RUNTIME,
  });
  return new Response(JSON.stringify({ message: 'Hello from Edge!' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

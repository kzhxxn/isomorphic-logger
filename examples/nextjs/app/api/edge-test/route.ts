import { Logger } from 'isomorphic-logger-ts';

export const runtime = 'edge';

export async function GET(request: Request) {
  Logger.info('Edge Runtime 종합 테스트 시작', {
    nextRuntime: process.env.NEXT_RUNTIME,
  });

  const tests = {
    fs: testFS(),
    path: testPath(),
    crypto: testCrypto(),
    buffer: testBuffer(),
  };

  Logger.info('테스트 결과', tests);

  return Response.json({
    runtime: process.env.NEXT_RUNTIME,
    tests,
  });
}

function testFS() {
  try {
    const fs = require('fs');
    fs.existsSync('/');
    return { available: true, error: null };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

function testPath() {
  try {
    const path = require('path');
    path.join('/', 'test');
    return { available: true, error: null };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

function testCrypto() {
  try {
    const crypto = require('crypto');
    crypto.randomBytes(16);
    return { available: true, error: null };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

function testBuffer() {
  try {
    Buffer.from('test');
    return { available: true, error: null };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

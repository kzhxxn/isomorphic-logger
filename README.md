# isomorphic-logger

경량, 환경 감지 기반의 일관된 로깅 라이브러리 (TypeScript)

## 소개

`isomorphic-logger`는 Next.js, 브라우저, Node.js, 서버리스 등 다양한 런타임에서 일관된 API로 로그를 남길 수 있는 경량 로거입니다. 환경 자동 감지, 로그 레벨 관리, 어댑터 패턴, 타입 안전성, 테스트/품질 관리가 주요 특징입니다.

## 내부 구조 및 주요 구현 특징

- **글로벌 레지스트리 기반**: 환경별로 단일 글로벌 레지스트리(`registry`)를 사용하여 어댑터, 버퍼, 컨텍스트를 관리합니다.
- **비동기 버퍼 처리**: 초기화 전 로그는 버퍼에 저장되고, 초기화 후 비동기로 모두 flush되어 유실 없이 처리됩니다.
- **어댑터 패턴**: 여러 로깅 어댑터를 동적으로 추가/관리할 수 있어 확장성이 높습니다.
- **컨텍스트 자동 병합**: 로그마다 실행 환경(runtime), 타임스탬프(ts) 등 컨텍스트가 자동 병합 및 확장됩니다.
- **런타임 감지**: 브라우저, 서버(Node.js), Edge 환경을 자동으로 감지하여 적절한 동작을 수행합니다.
- **에러 격리**: 어댑터 실행 중 에러 발생 시 전체 로깅에 영향 없이 격리 처리되어 안전합니다.
- **정적 API 제공**: `Logger` 클래스의 정적 메서드(`info`, `warn`, `error` 등)로 간편하게 로그를 기록할 수 있습니다.

## 설치

```sh
pnpm add isomorphic-logger
# 또는
npm install isomorphic-logger
```

## 기본 사용법

### 1. 초기화 (필수)

애플리케이션 진입점에서 `initLogger`를 호출하여 어댑터를 등록해야 합니다.

```ts
import { initLogger, ConsoleAdapter } from 'isomorphic-logger';

// 앱 시작 시 한 번만 호출
initLogger([new ConsoleAdapter()]);
```

### 2. 로그 기록

```ts
import { Logger } from 'isomorphic-logger';

Logger.info('정보 로그');
Logger.warn('경고 로그');
Logger.error('에러 로그');
Logger.debug('디버그 로그');
Logger.verbose('상세 로그');
```

## Next.js 예제

### App Router (app/layout.tsx)

```ts
import { initLogger, ConsoleAdapter } from 'isomorphic-logger';

// 서버 컴포넌트에서 초기화
initLogger([new ConsoleAdapter()], 'server');

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Pages Router (pages/\_app.tsx)

```ts
import { initLogger, ConsoleAdapter, Logger } from 'isomorphic-logger';
import { useEffect } from 'react';

// 클라이언트 측 초기화
if (typeof window !== 'undefined') {
  initLogger([new ConsoleAdapter()], 'client');
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    Logger.info('앱이 마운트되었습니다');
  }, []);

  return <Component {...pageProps} />;
}
```

### 컴포넌트에서 사용

```ts
'use client';
import { Logger } from 'isomorphic-logger';

export default function MyComponent() {
  const handleClick = () => {
    Logger.info('버튼 클릭됨', { userId: '123' });
  };

  return <button onClick={handleClick}>클릭</button>;
}
```

## Node.js 예제

```ts
import { initLogger, ConsoleAdapter, Logger } from 'isomorphic-logger';

// 서버 시작 시 초기화
initLogger([new ConsoleAdapter()], 'server');

Logger.info('서버가 시작되었습니다', { port: 3000 });
```

## 커스텀 어댑터 사용

```ts
import {
  initLogger,
  LoggerAdapter,
  Logger,
  LogContext,
} from 'isomorphic-logger';

// 커스텀 어댑터 구현
class MyCustomAdapter implements LoggerAdapter {
  info(msg: string, ctx?: LogContext) {
    console.log('[CUSTOM INFO]', msg, ctx);
  }
  warn(msg: string, ctx?: LogContext) {
    console.warn('[CUSTOM WARN]', msg, ctx);
  }
  error(msg: string, ctx?: LogContext) {
    console.error('[CUSTOM ERROR]', msg, ctx);
  }
  // debug, verbose 메서드도 구현 가능
}

// 여러 어댑터 동시 사용
initLogger([new ConsoleAdapter(), new MyCustomAdapter()]);

Logger.info('여러 어댑터로 동시에 기록됩니다');
```

## 컨텍스트 프로바이더

모든 로그에 자동으로 추가될 컨텍스트를 설정할 수 있습니다.

```ts
import { setContextProvider } from 'isomorphic-logger';

// 동기 컨텍스트
setContextProvider(() => ({
  userId: getCurrentUserId(),
  sessionId: getSessionId(),
}));

// 비동기 컨텍스트
setContextProvider(async () => ({
  userId: await fetchCurrentUserId(),
  traceId: await getTraceId(),
}));
```

## 동적 어댑터 추가

초기화 후에도 어댑터를 추가할 수 있습니다.

```ts
import { addAdapters } from 'isomorphic-logger';

// 런타임에 어댑터 추가
addAdapters(new MyNewAdapter());
```

## API

### Logger (정적 메서드)

- `Logger.verbose(msg: string, ctx?: LogContext)`: 상세 로그
- `Logger.debug(msg: string, ctx?: LogContext)`: 디버그 로그
- `Logger.info(msg: string, ctx?: LogContext)`: 정보 로그
- `Logger.warn(msg: string, ctx?: LogContext)`: 경고 로그
- `Logger.error(msg: string, ctx?: LogContext)`: 에러 로그

### 초기화 함수

- `initLogger(adapters: LoggerAdapter[], runtime?: Runtime)`: 로거 초기화 (필수)
- `addAdapters(...adapters: LoggerAdapter[])`: 어댑터 동적 추가
- `setContextProvider(fn: ContextProvider)`: 글로벌 컨텍스트 프로바이더 설정
- `setRuntime(runtime: Runtime)`: 런타임 환경 수동 설정

### 타입

```ts
type Runtime = 'client' | 'server' | 'edge';

interface LogContext {
  runtime?: Runtime;
  ts?: number;
  [key: string]: unknown;
}

interface LoggerAdapter {
  verbose?(msg: string, ctx?: LogContext): void;
  debug?(msg: string, ctx?: LogContext): void;
  info?(msg: string, ctx?: LogContext): void;
  warn?(msg: string, ctx?: LogContext): void;
  error?(msg: string, ctx?: LogContext): void;
}

type ContextProvider =
  | (() => Partial<LogContext> | Promise<Partial<LogContext>> | undefined)
  | null;
```

## 주요 특징

### 초기화 전 로그 유실 방지

`initLogger` 호출 전에 기록된 로그는 자동으로 버퍼에 저장되며, 초기화 후 모두 처리됩니다.

```ts
// 초기화 전
Logger.info('이 로그는 버퍼에 저장됨');

// 초기화
initLogger([new ConsoleAdapter()]);
// ↑ 버퍼에 저장된 로그가 모두 flush됨
```

### 자동 런타임 감지

런타임 파라미터를 생략하면 자동으로 환경을 감지합니다.

```ts
// 자동 감지
initLogger([new ConsoleAdapter()]);

// 수동 지정
initLogger([new ConsoleAdapter()], 'edge');
```

### 에러 안전성

어댑터에서 에러가 발생해도 다른 어댑터나 애플리케이션에 영향을 주지 않습니다.

```ts
class FailingAdapter implements LoggerAdapter {
  info() {
    throw new Error('어댑터 에러');
  }
}

initLogger([
  new FailingAdapter(), // 에러 발생해도
  new ConsoleAdapter(), // 이 어댑터는 정상 동작
]);
```

## 테스트

```sh
pnpm test
```

## 타입 체크

```sh
pnpm typecheck
```

## 린트

```sh
pnpm lint
```

## 커밋 메시지 규칙

Conventional Commit 규칙 적용

## 라이선스

ISC

## 기여

PR 및 이슈 환영합니다!

## 링크

- [GitHub](https://github.com/kzhxxn/isomorphic-logger)
- [npm](https://www.npmjs.com/package/isomorphic-logger)

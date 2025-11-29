'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  Logger,
  LogLevel,
  initLogger,
  addAdapters,
  LoggerAdapter,
  ConsoleAdapter,
  setContextProvider,
} from 'isomorphic-logger-ts';

type AdapterInput = LoggerAdapter[] | (() => LoggerAdapter[]);

export interface LoggerProviderProps {
  /** 콘솔 출력 최소 레벨 (null이면 콘솔 어댑터 미주입) */
  consoleLevel?: LogLevel | null;
  /** 외부(워크스페이스)에서 주입할 어댑터 배열 또는 팩토리 */
  adapters?: AdapterInput;
  /** 브라우저 전역 에러 자동 수집 */
  captureGlobalErrors?: boolean;
  children: React.ReactNode;
}

/**
 * 얇은 Provider: 코어를 부트스트랩하고, 프롭스로 받은 어댑터를 주입한다.
 * - 싱글톤 레지스트리이므로 HMR 중복 초기화에도 안전
 * - 초기화 이전 로그는 코어 버퍼가 자동으로 flush
 */
export function LoggerProvider({
  consoleLevel = LogLevel.Debug,
  adapters = [],
  captureGlobalErrors = true,
  children,
}: LoggerProviderProps) {
  // (1) 콘솔 어댑터 구성
  const builtinAdapters = useMemo(() => {
    return consoleLevel == null ? [] : [new ConsoleAdapter(consoleLevel)];
  }, [consoleLevel]);

  // (2) 외부 어댑터(팩토리 허용) 구성
  const externalAdapters = useMemo(
    () => (typeof adapters === 'function' ? adapters() : adapters),
    [adapters]
  );

  // (3) 중복 주입 방지(개발 HMR 대비)
  const seen = useRef<WeakSet<LoggerAdapter>>(new WeakSet());

  useEffect(() => {
    // 1) 클라에서 sessionId 쿠키를 읽어 컨텍스트 먼저 주입
    const sid = document.cookie
      .split('; ')
      .find((v) => v.startsWith('x-session-id='))
      ?.split('=')[1];
    setContextProvider(() => (sid ? { sessionId: sid } : {}));

    // 2) 그 다음 로거 초기화/어댑터 주입
    initLogger(builtinAdapters, 'client');
    const uniques = externalAdapters.filter((a) => {
      const first = !seen.current.has(a);
      if (first) seen.current.add(a);
      return first;
    });
    if (uniques.length) addAdapters(...uniques);

    // 3) 이제 찍는 로그엔 sessionId가 포함됨
    Logger.info('client-logger-initialized');
  }, []);

  // (4) 브라우저 전역 에러 자동 수집(옵션)
  useEffect(() => {
    if (!captureGlobalErrors) return;
    const onErr = (e: ErrorEvent) =>
      Logger.error('client-runtime-error', { error: e.error ?? e.message });
    const onRej = (e: PromiseRejectionEvent) =>
      Logger.error('unhandled-rejection', { reason: e.reason });
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, [captureGlobalErrors]);

  return <>{children}</>;
}

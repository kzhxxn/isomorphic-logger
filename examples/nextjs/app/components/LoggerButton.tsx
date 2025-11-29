// app/components/LoggerButton.tsx
'use client';
import { Logger } from 'isomorphic-logger-ts';

export default function LoggerButton() {
  const handleClick = () => {
    Logger.info('버튼이 클릭되었습니다!', { source: 'LoggerButton' });
  };

  return (
    <button onClick={handleClick} style={{ padding: '8px 16px', fontSize: '16px' }}>
      로그 버튼 클릭
    </button>
  );
}

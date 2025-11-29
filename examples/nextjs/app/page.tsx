import { Logger } from 'isomorphic-logger-ts';

import LoggerButton from './components/LoggerButton';

export default function Home() {
  Logger.info('Home page loaded');
  return (
    <main style={{ padding: '32px' }}>
      <h1>Next.js Logger Example</h1>
      <LoggerButton />
    </main>
  );
}

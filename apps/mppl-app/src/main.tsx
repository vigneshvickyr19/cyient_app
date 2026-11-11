import { AppProviders, createAuthSession } from '@cyient/shared-ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { env } from './config/env';
import { createStaticMockHttp } from './mockData';

const session = createAuthSession(env.auth);
const http = createStaticMockHttp();

const root = document.getElementById('root');
if (!root) throw new Error('The page has no #root element.');

createRoot(root).render(
  <StrictMode>
    <AppProviders session={session} http={http}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <App />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);

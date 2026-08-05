import { datadogRum } from '@datadog/browser-rum';
import { createNextjsPlugin } from '@datadog/browser-rum-nextjs';
import fs from 'fs';
import path from 'path';

const isBrowser = typeof window !== 'undefined';

let appVersion = 'unknown';
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  appVersion = packageJson.version || 'unknown';
} catch (error) {
  console.error('Failed to read package.json for app version:', error);
}

export function register() {
  if (!isBrowser) return;

  const DATADOG_APPLICATION_ID = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
  const DATADOG_CLIENT_TOKEN = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
  const DATADOG_SERVICE = process.env.NEXT_PUBLIC_DATADOG_SERVICE || 'beforetobuy-frontend';
  const DATADOG_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';
  const DATADOG_SITE = process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com';

  if (!DATADOG_APPLICATION_ID || !DATADOG_CLIENT_TOKEN) {
    console.warn('Datadog RUM is not configured. Missing NEXT_PUBLIC_DATADOG_APPLICATION_ID or NEXT_PUBLIC_DATADOG_CLIENT_TOKEN.');
    return;
  }

  datadogRum.init({
    applicationId: DATADOG_APPLICATION_ID,
    clientToken: DATADOG_CLIENT_TOKEN,
    site: DATADOG_SITE,
    service: DATADOG_SERVICE,
    env: DATADOG_ENV,
    version: appVersion,
    sampleRate: DATADOG_ENV === 'production' ? 10 : 100,
    sessionReactivityFullTrackedResources: true,
    sessionSampleRate: DATADOG_ENV === 'production' ? 10 : 100,
    sessionReplaySampleRate: DATADOG_ENV === 'production' ? 10 : 100,
    trackResources: true,
    trackLongTasks: true,
    trackViews: true,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
    allowedTracingOrigins: ['https://www.beforetobuy.com'], // Replace with your actual domain
    ...createNextjsPlugin(),
  });

  // Add global error handling for Datadog
  // Next.js error.tsx files are automatically picked up by the plugin
  // You can manually add errors in try/catch blocks via datadogRum.addError()
}

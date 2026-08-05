import { datadogRum } from '@datadog/browser-rum';
import { createNextjsPlugin } from '@datadog/browser-rum-nextjs';

const isBrowser = typeof window !== 'undefined';

export function register() {
  if (!isBrowser) return;

  const DATADOG_APPLICATION_ID = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
  const DATADOG_CLIENT_TOKEN = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
  const DATADOG_SERVICE = process.env.NEXT_PUBLIC_DATADOG_SERVICE || 'beforetobuy-frontend';
  const DATADOG_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';

  if (!DATADOG_APPLICATION_ID || !DATADOG_CLIENT_TOKEN) {
    console.warn('Datadog RUM is not configured. Missing NEXT_PUBLIC_DATADOG_APPLICATION_ID or NEXT_PUBLIC_DATADOG_CLIENT_TOKEN.');
    return;
  }

  datadogRum.init({
    applicationId: DATADOG_APPLICATION_ID,
    clientToken: DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com', // Or 'datadoghq.eu' if in Europe
    service: DATADOG_SERVICE,
    env: DATADOG_ENV,
    version: '1.0.0', // Consider dynamic versioning (e.g., from package.json)
    sampleRate: 100, // Adjust as needed (e.g., 100 for all sessions, 10 for 10%)
    sessionReactivityFullTrackedResources: true,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
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

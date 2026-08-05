"use client";

import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";
import { nextjsPlugin } from "@datadog/browser-rum-nextjs";

/**
 * Browser-only Datadog RUM initializer.
 * Must run in a client component — instrumentation.ts register() is server-only.
 */
export function DatadogRum() {
  useEffect(() => {
    const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
    const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
    const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE || "beforetobuy-frontend";
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";
    const site = process.env.NEXT_PUBLIC_DATADOG_SITE || "datadoghq.com";
    const version = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0";

    if (!applicationId || !clientToken) {
      return;
    }

    const sampleRate = env === "production" ? 10 : 100;

    datadogRum.init({
      applicationId,
      clientToken,
      site,
      service,
      env,
      version,
      sessionSampleRate: sampleRate,
      sessionReplaySampleRate: sampleRate,
      trackResources: true,
      trackLongTasks: true,
      trackUserInteractions: true,
      defaultPrivacyLevel: "mask-user-input",
      allowedTracingUrls: [
        { match: "https://www.beforetobuy.com", propagatorTypes: ["datadog"] },
      ],
      plugins: [nextjsPlugin()],
    });
  }, []);

  return null;
}

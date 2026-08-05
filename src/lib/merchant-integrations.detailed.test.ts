import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveFeedRemoteUrl,
  getFeedMode,
  FeedConfig,
} from './merchant-integrations';

describe('resolveFeedRemoteUrl', () => {
  const mockFeed: FeedConfig = {
    provider: 'AWIN',
    country: 'CH',
    merchantId: 'test-merchant',
    merchantName: 'Test Merchant',
    envVar: 'TEST_ENV_VAR',
    legacyEnvVars: ['TEST_LEGACY_ENV_VAR_1', 'TEST_LEGACY_ENV_VAR_2'],
  };

  beforeEach(() => {
    // Clear all environment variables before each test
    vi.stubGlobal('process', { env: {} });
  });

  it('should return the primary environment variable if set', () => {
    process.env.TEST_ENV_VAR = 'https://primary.example.com';
    expect(resolveFeedRemoteUrl(mockFeed)).toBe('https://primary.example.com');
  });

  it('should return the first legacy environment variable if primary is not set', () => {
    process.env.TEST_LEGACY_ENV_VAR_1 = 'https://legacy1.example.com';
    expect(resolveFeedRemoteUrl(mockFeed)).toBe('https://legacy1.example.com');
  });

  it('should return the second legacy environment variable if the first is not set', () => {
    process.env.TEST_LEGACY_ENV_VAR_2 = 'https://legacy2.example.com';
    expect(resolveFeedRemoteUrl(mockFeed)).toBe('https://legacy2.example.com');
  });

  it('should return undefined if no environment variables are set', () => {
    expect(resolveFeedRemoteUrl(mockFeed)).toBeUndefined();
  });

  it('should trim whitespace from the environment variable value', () => {
    process.env.TEST_ENV_VAR = '  https://trimmed.example.com   ';
    expect(resolveFeedRemoteUrl(mockFeed)).toBe('https://trimmed.example.com');
  });
});

describe('getFeedMode', () => {
  beforeEach(() => {
    // Clear all environment variables before each test
    vi.stubGlobal('process', { env: {} });
  });

  it('should return "production" if resolveFeedRemoteUrl returns a URL', () => {
    const feed: FeedConfig = {
      provider: 'AWIN',
      country: 'CH',
      merchantId: 'test-merchant',
      merchantName: 'Test Merchant',
      envVar: 'PRODUCTION_FEED',
    };
    process.env.PRODUCTION_FEED = 'https://production.example.com';
    expect(getFeedMode(feed)).toBe('production');
  });

  it('should return "sample" if resolveFeedRemoteUrl is undefined but sampleFile is present', () => {
    const feed: FeedConfig = {
      provider: 'AWIN',
      country: 'CH',
      merchantId: 'test-merchant',
      merchantName: 'Test Merchant',
      envVar: 'PRODUCTION_FEED',
      sampleFile: 'sample.csv',
    };
    expect(getFeedMode(feed)).toBe('sample');
  });

  it('should return "unconfigured" if neither production URL nor sampleFile is present', () => {
    const feed: FeedConfig = {
      provider: 'AWIN',
      country: 'CH',
      merchantId: 'test-merchant',
      merchantName: 'Test Merchant',
      envVar: 'PRODUCTION_FEED',
    };
    expect(getFeedMode(feed)).toBe('unconfigured');
  });
});

/**
 * Web Vitals utility for tracking Core Web Vitals metrics
 * This utility integrates with the web-vitals library to track performance metrics
 * 
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): measures loading performance
 * - FID (First Input Delay): measures interactivity
 * - CLS (Cumulative Layout Shift): measures visual stability
 * 
 * Additional metrics:
 * - FCP (First Contentful Paint): measures when the first content is painted
 * - TTFB (Time to First Byte): measures time until the first byte of the page is received
 */

// Web Vitals metric interface
interface WebVitalMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

// Rating thresholds for Core Web Vitals
const LCP_THRESHOLD_GOOD = 2500; // ms
const LCP_THRESHOLD_POOR = 4000; // ms
const FID_THRESHOLD_GOOD = 100; // ms
const FID_THRESHOLD_POOR = 300; // ms
const CLS_THRESHOLD_GOOD = 0.1; // score
const CLS_THRESHOLD_POOR = 0.25; // score
const FCP_THRESHOLD_GOOD = 1800; // ms
const FCP_THRESHOLD_POOR = 3000; // ms
const TTFB_THRESHOLD_GOOD = 800; // ms
const TTFB_THRESHOLD_POOR = 1800; // ms

/**
 * Get the rating of a Web Vital metric
 * @param name Metric name
 * @param value Metric value
 * @returns Rating: 'good', 'needs-improvement', or 'poor'
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      return value <= LCP_THRESHOLD_GOOD ? 'good' : 
             value <= LCP_THRESHOLD_POOR ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= FID_THRESHOLD_GOOD ? 'good' : 
             value <= FID_THRESHOLD_POOR ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= CLS_THRESHOLD_GOOD ? 'good' : 
             value <= CLS_THRESHOLD_POOR ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= FCP_THRESHOLD_GOOD ? 'good' : 
             value <= FCP_THRESHOLD_POOR ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= TTFB_THRESHOLD_GOOD ? 'good' : 
             value <= TTFB_THRESHOLD_POOR ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
}

/**
 * Report a Web Vital metric to the monitoring service
 * @param metric Web Vital metric
 */
function reportWebVital(metric: WebVitalMetric) {
  // Get the metric rating
  const rating = getRating(metric.name, metric.value);
  
  // Log the metric to the console
  console.log(`Web Vital: ${metric.name}`, {
    value: metric.value,
    rating,
    delta: metric.delta,
    id: metric.id
  });
  
  // In a real implementation, you would send the metric to your monitoring service
  // Example with Sentry:
  // import * as Sentry from '@sentry/browser';
  // Sentry.captureMessage(`WebVital: ${metric.name}`, {
  //   level: rating === 'poor' ? 'warning' : 'info',
  //   tags: { name: metric.name, rating },
  //   extra: { value: metric.value, delta: metric.delta, id: metric.id }
  // });
  
  // Example with Google Analytics:
  // window.gtag('event', 'web_vitals', {
  //   event_category: 'Web Vitals',
  //   event_label: metric.name,
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   non_interaction: true,
  //   metric_rating: rating,
  //   metric_delta: metric.delta,
  //   metric_id: metric.id
  // });
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  // In a real implementation, you would use the web-vitals library
  // Example:
  // import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';
  // getCLS(reportWebVital);
  // getFID(reportWebVital);
  // getLCP(reportWebVital);
  // getFCP(reportWebVital);
  // getTTFB(reportWebVital);
  
  console.log('Web Vitals tracking initialized');
}

/**
 * Get the current performance metrics
 * @returns Object with performance metrics
 */
export function getPerformanceMetrics() {
  if (!window.performance || !window.performance.timing) {
    return null;
  }
  
  const timing = window.performance.timing;
  
  // Calculate performance metrics
  return {
    // Navigation timing
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnection: timing.connectEnd - timing.connectStart,
    serverResponse: timing.responseStart - timing.requestStart,
    domLoading: timing.domLoading - timing.responseEnd,
    domInteractive: timing.domInteractive - timing.responseEnd,
    domComplete: timing.domComplete - timing.responseEnd,
    loadEvent: timing.loadEventEnd - timing.loadEventStart,
    totalPageLoad: timing.loadEventEnd - timing.navigationStart,
    
    // Resource timing
    resources: Array.from(window.performance.getEntriesByType('resource')).map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as PerformanceResourceTiming).transferSize || 0,
      type: entry.initiatorType
    }))
  };
}
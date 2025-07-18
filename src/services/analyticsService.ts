/**
 * Analytics service for tracking user interactions and page views
 * This service integrates with Google Analytics for tracking user behavior
 * 
 * In a production environment, you would replace the mock implementations with actual GA4 calls
 */

// Event tracking interface
interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  [key: string]: any;
}

// User properties interface
interface UserProperties {
  [key: string]: string | number | boolean;
}

/**
 * Initialize the analytics service
 * @param options Configuration options
 */
export function initAnalytics(options: {
  measurementId?: string;
  debug?: boolean;
}) {
  console.log('Initializing analytics service with options:', options);
  
  // In a real implementation, you would initialize Google Analytics here
  // Example:
  // const script = document.createElement('script');
  // script.async = true;
  // script.src = `https://www.googletagmanager.com/gtag/js?id=${options.measurementId}`;
  // document.head.appendChild(script);
  
  // window.dataLayer = window.dataLayer || [];
  // function gtag(...args: any[]) {
  //   window.dataLayer.push(args);
  // }
  // gtag('js', new Date());
  // gtag('config', options.measurementId, { debug_mode: options.debug });
}

/**
 * Track a page view
 * @param path Page path
 * @param title Page title
 */
export function trackPageView(path: string, title?: string) {
  console.log('Tracked page view:', { path, title });
  
  // In a real implementation, you would track the page view in Google Analytics
  // Example:
  // window.gtag('event', 'page_view', {
  //   page_path: path,
  //   page_title: title,
  //   page_location: window.location.href
  // });
}

/**
 * Track an event
 * @param event Event details
 */
export function trackEvent(event: AnalyticsEvent) {
  console.log('Tracked event:', event);
  
  // In a real implementation, you would track the event in Google Analytics
  // Example:
  // window.gtag('event', event.action, {
  //   event_category: event.category,
  //   event_label: event.label,
  //   value: event.value,
  //   non_interaction: event.nonInteraction,
  //   ...Object.fromEntries(
  //     Object.entries(event).filter(([key]) => 
  //       !['action', 'category', 'label', 'value', 'nonInteraction'].includes(key)
  //     )
  //   )
  // });
}

/**
 * Set user properties
 * @param properties User properties
 */
export function setUserProperties(properties: UserProperties) {
  console.log('Set user properties:', properties);
  
  // In a real implementation, you would set the user properties in Google Analytics
  // Example:
  // window.gtag('set', 'user_properties', properties);
}

/**
 * Track an exception
 * @param description Exception description
 * @param fatal Whether the exception was fatal
 */
export function trackException(description: string, fatal: boolean = false) {
  console.log('Tracked exception:', { description, fatal });
  
  // In a real implementation, you would track the exception in Google Analytics
  // Example:
  // window.gtag('event', 'exception', {
  //   description,
  //   fatal
  // });
}

/**
 * Create a custom analytics hook for React components
 */
export function useAnalytics() {
  return {
    trackPageView,
    trackEvent,
    setUserProperties,
    trackException
  };
}
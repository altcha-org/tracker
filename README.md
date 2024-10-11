# ALTCHA Analytics Tracker

This repository contains the front-end library for collecting analytics data with ALTCHA Analytics.

## Why ALTCHA Analytics?

ALTCHA Analytics provides a privacy-first, GDPR-compliant alternative to traditional analytics platforms like Google Analytics. Unlike most other services, it operates without cookies or fingerprinting, ensuring that all data is anonymized by default.

**Key Features**:
- Compliant with GDPR, CCPA, and PECR regulations
- No cookies or fingerprinting required
- Flexible: Use for web, app, or API analytics
- Customizable event tracking and properties
- Lightweight (~3.5kB gzipped)

## Installation & Usage

You can integrate ALTCHA Analytics in two ways:

1. **Module** (Recommended for modern frameworks such as React, Vue, Angular)
2. **Script Tag** (Simple HTML inclusion)

### 1. Module Installation (Preferred for Frameworks)

Install via npm:

```bash
npm install @altcha/tracker
```

Initialize the tracker in your app:

```javascript
import { Tracker } from '@altcha/tracker';

const tracker = new Tracker({
  projectId: 'pro_...',
});
```

### 2. Script Tag Integration

Simply add the following snippet to your HTML:

```html
<script
  defer
  data-project-id="pro_..."
  src="https://eu.altcha.org/js/script.js"
></script>
```

Make sure to replace `"pro_..."` with your unique `projectId`.

## Configuration

The `Tracker` class constructor accepts the following configuration options:

- **`allowSearchParams?: string[]`** – By default, the script removes all query parameters (those after `?` in the URL). Use this option to whitelist specific parameters that should be tracked.
- **`apiUrl?: string`** – Override the default API URL for reporting events.
- **`appVersion?: string`** – Track the version of your application (max 12 characters).
- **`click?: IBaseExtensionOptions | boolean`** – Disable or configure the `click` extension (see below for details).
- **`cookie?: ICookieExtensionOptions | boolean`** – Disable or configure the `cookie` extension.
- **`debug?: boolean`** – Enable debug mode for logging.
- **`globalName?: string | null | false`** – Override the default global variable name for the Tracker instance. Set to `null` to skip global registration.
- **`hash?: IBaseExtensionOptions | boolean`** – Disable or configure the `hash` extension.
- **`keyboard?: IBaseExtensionOptions | boolean`** – Disable or configure the `keyboard` extension.
- **`mouse?: IBaseExtensionOptions | boolean`** – Disable or configure the `mouse` extension.
- **`projectId: string`** – Required ALTCHA project ID (format: `pro_{unique_id}`).
- **`pushstate?: IBaseExtensionOptions | boolean`** – Disable or configure the `pushstate` extension.
- **`respectDnt?: boolean`** – When `true`, the tracker will not report any events if the user's browser is configured with `Do Not Track` or `globalPrivacyControl`.
- **`uniqueId?: string`** – Provide the user's unique ID, if applicable, to track returning visitors.
- **`visibility?: IVisibilityExtensionOptions | boolean`** – Disable or configure the `visibility` extension.

These options can also be provided as attributes in the `<script>` tag, for example: `data-project-id="pro_..."`.

### Example Configuration:

```javascript
new Tracker({
  projectId: 'pro_...',
  appVersion: 'v1.0.1',
  debug: true,
  respectDnt: true,
  allowSearchParams: ['page_id'],
});
```

### HTML Example Configuration:

```html
<script
  defer
  data-project-id="pro_..."
  data-app-version="v1.0.1"
  data-debug="true"
  data-respect-dnt="true"
  src="https://eu.altcha.org/js/script.js"
></script>
```

## Extensions

Tracking features are provided through "extensions," which can be individually enabled or disabled depending on your needs and privacy concerns.

### Click

Enabled by default.  

Tracks user mouse/pointer interactions, detecting exit events and outbound links.

### Cookie

Disabled by default.  

The `cookie` extension tracks returning visitors by setting a small cookie (`_altcha_visited=1`) that expires in 30 days.

You can configure this extension with the following options:

```js
new Tracker({
  projectId: '...',
  cookie: {
    cookieExpireDays: 30, // Cookie expiration in days
    cookieName: '_altcha_visited', // Cookie name
    cookiePath: '/', // Cookie path (defaults to '/')
  }
})
```

Note: Enabling this extension may require user consent under GDPR.

### Hash

Disabled by default.  

Tracks the `#hash` part of the URL when using hash-based routing in your application.

### Keyboard

Enabled by default.  

Detects exit events triggered by keyboard shortcuts (e.g., closing the tab).

### Mouse

Enabled by default.  

Detects exit events triggered by pointer (e.g., closing the tab using the mouse).

### PushState

Enabled by default.  

Automatically detects pageviews when `history.pushState()` is called. If disabled, use `.trackPageview()` or `.trackEvent()` to manually report events.

### Visibility

Enabled by default.  

Tracks exit events when the tab/window is hidden during page unload.

## Implementation Details

This script reports collected events in bulk when the page unloads, using the [`sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) function. You can configure the API endpoint via the `apiUrl` option.

### Exit Events

Exit events are reported when the user leaves the website (e.g., by closing the tab or navigating elsewhere).  
To track these events accurately, ensure the following extensions are enabled: `click`, `keyboard`, `mouse`, `visibility`. Disabling these will reduce the accuracy of visit duration data.

### Respect for Privacy (Do Not Track)

If you respect users' privacy preferences and want to disable tracking when `Do Not Track` is enabled in the browser, you can set the `respectDnt` option to `true`.

```javascript
new Tracker({
  projectId: '...',
  respectDnt: true, // disable tracking for users with Do Not Track enabled
});
```

### Debug Mode

Enabling `debug` mode logs additional information to the browser console, which is helpful for development purposes.

```javascript
new Tracker({
  projectId: '...',
  debug: true, // enable debug logging
});
```

## API Reference

The following is a quick overview of the main methods available in the ALTCHA Analytics tracker:

- `trackPageview(event: IEvent, unload: boolean = false)`: Track page views.
- `trackEvent(event: IEvent, unload: boolean = false)`: Track custom events.
- `destroy()`: Destroys the tracker instance.

### Types

For TypeScript types and interfaces, see [/src/types.ts](/src/types.ts).


## License

ALTCHA Analytics is licensed under the MIT License. See the `LICENSE` file for more details.

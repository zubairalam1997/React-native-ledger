# React Native Frontend Port

This folder contains a separate React Native frontend that mirrors the current React web app's:

- theme and core colors
- API endpoints and request paths
- context-based state management
- main flows: login, ledger home, add customer, customer ledger, add transaction, notifications

## Structure

```text
react-native-app/
  App.js
  app.json
  babel.config.js
  .env.example
  src/
    components/
    context/
    lib/
    navigation/
    screens/
    theme/
```

## Mobile-specific improvements included

- safe-area handling with `react-native-safe-area-context`
- larger touch targets for buttons and row taps
- keyboard avoidance on forms
- pull-to-refresh on the ledger home screen
- bottom-sheet style notification modal
- image picker flow for bill attachment previews
- stack navigation instead of browser routing

## Setup

1. Open this folder:
   `cd react-native-app`
2. Create your env file from `.env.example`.
3. Install dependencies:
   `npm install`
4. If you are using Expo managed workflow, run Expo-compatible installs as needed:
   `npx expo install @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens react-native-gesture-handler expo-image-picker`
5. Start the app:
   `npm run start`

## Endpoint handling

The mobile app keeps the same backend path usage as the web app. Set:

`EXPO_PUBLIC_API_BASE_URL=http://localhost:5000`

Then the app will continue calling the same paths such as:

- `/auth/login`
- `/customers`
- `/transactions`
- `/notifications`

## Notes

- Storage is moved from `localStorage` to `AsyncStorage`.
- Navigation state replaces `react-router-dom`.
- Bill image selection is implemented for mobile UX, but if your backend expects multipart upload later, the request helper can be extended without changing screen flow.

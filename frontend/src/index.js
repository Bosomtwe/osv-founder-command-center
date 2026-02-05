import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register();

// Add iOS PWA detection
if (window.navigator.standalone === true) {
  document.body.classList.add('pwa-ios');
  console.log('Running in iOS PWA mode');
}

// Add Android PWA detection
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.body.classList.add('pwa-android');
  console.log('Running in Android PWA mode');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
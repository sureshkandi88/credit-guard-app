import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault(); // Prevent default error logging
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Bootstrap Error:', err);
    // Optional: Display a user-friendly error message
    // Optional: Send error to logging service
  });

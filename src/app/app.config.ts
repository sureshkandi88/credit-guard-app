import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { provideReactiveFormsModule } from './utils/reactive-forms.provider';

// Custom Global Error Handler
class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Unhandled Error:', error);
    // Optional: Send error to logging service
    // Optional: Display user-friendly error notification
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideReactiveFormsModule(),
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};

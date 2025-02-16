import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

export function provideReactiveFormsModule() {
  return importProvidersFrom(ReactiveFormsModule);
}

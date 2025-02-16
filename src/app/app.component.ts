import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CustomersComponent, 
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'credit-guard-app';
}

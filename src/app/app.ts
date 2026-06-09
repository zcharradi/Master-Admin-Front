import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationModule } from '@progress/kendo-angular-notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationModule],
  template: `
    <kendo-notification-container></kendo-notification-container>
    <router-outlet />
  `,
})
export class AppComponent {}


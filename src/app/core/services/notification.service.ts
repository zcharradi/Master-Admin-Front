import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NotificationService } from "@progress/kendo-angular-notification";

@Injectable({ providedIn: "root" })
export class UiNotificationService {
  constructor(private readonly notification: NotificationService) {}

  success(message: string): void {
    this.notification.show({ content: message, type: { style: "success" }, hideAfter: 2500 });
  }

  warning(message: string): void {
    this.notification.show({ content: message, type: { style: "warning" }, hideAfter: 3000 });
  }

  error(message: string): void {
    this.notification.show({ content: message, type: { style: "error" }, hideAfter: 4000 });
  }

  fromHttpError(error: HttpErrorResponse): void {
    const apiMessage = (error.error && (error.error.message || error.error.error)) ?? error.message;
    this.error(apiMessage || "An error occurred");
  }
}

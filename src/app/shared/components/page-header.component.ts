import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ButtonsModule } from "@progress/kendo-angular-buttons";

export interface PageHeaderAction {
  label: string;
  icon?: string;
  look?: "default" | "outline" | "flat" | "clear";
  primary?: boolean;
  onClick: () => void;
}

@Component({
  selector: "app-page-header",
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ButtonsModule],
  template: `
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
      <!-- Title block -->
      <div class="space-y-1 min-w-0">
        @if (badge) {
          <p class="text-[11px] font-bold uppercase tracking-widest text-primary-500">{{ badge }}</p>
        }
        <h1 class="text-2xl font-bold text-default leading-tight">{{ title }}</h1>
        @if (subtitle) {
          <p class="text-sm text-secondary leading-relaxed">{{ subtitle }}</p>
        }
      </div>
      <!-- Actions -->
      @if (actions.length > 0) {
        <div class="flex items-center gap-2 flex-shrink-0">
          @for (action of actions; track action.label) {
            <button
              kendoButton
              [look]="action.look ?? 'flat'"
              [primary]="action.primary ?? false"
              (click)="action.onClick()">
              {{ action.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() badge?: string;
  @Input() actions: PageHeaderAction[] = [];
}

import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm border"
         style="border-color: rgba(var(--fuse-border-rgb), 0.10)">
      <!-- Label + trend -->
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold uppercase tracking-widest text-secondary">{{ label }}</span>
        @if (trend) {
          <span class="text-xs px-2 py-0.5 rounded-full font-semibold" [ngClass]="trendClass">{{ trend }}</span>
        }
      </div>
      <!-- Value -->
      <p class="text-3xl font-extrabold text-default leading-none">{{ value }}</p>
      <!-- Hint -->
      @if (hint) {
        <p class="text-xs text-secondary leading-relaxed -mt-1">{{ hint }}</p>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() hint?: string;
  @Input() trend: string = '';

  get trendClass(): string {
    if (!this.trend) return '';
    const lower = this.trend.toLowerCase();
    if (lower.startsWith('+')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (lower.startsWith('-')) return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }
}

import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { GridModule } from "@progress/kendo-angular-grid";

import { DashboardMetrics } from "@app/core/services/dashboard-api.service";
import * as DashboardActions from "./+state/dashboard.actions";
import * as DashboardSelectors from "./+state/dashboard.selectors";

interface HealthStat {
  label: string;
  value: string;
  hint: string;
  pct: number;
  valueClass: string;
  barClass: string;
}

@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [AsyncPipe, GridModule],
  template: `
<div class="flex flex-col gap-6">

  <!-- ─── Page Header ──────────────────────────────────────────────────── -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <p class="text-[11px] font-bold uppercase tracking-widest text-primary-500">Monitoring</p>
      <h1 class="text-2xl font-bold text-default mt-0.5">Dashboard Master</h1>
      <p class="text-sm text-secondary mt-0.5">ERP platform overview</p>
    </div>
  </div>

  @if (metrics$ | async; as m) {

    <!-- ─── KPI Cards ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Tenants -->
      <div class="kpi-card group">
        <div class="flex items-start justify-between mb-2">
          <p class="kpi-label">Tenants</p>
          <span class="kpi-badge kpi-badge--green">+{{ m.tenantsNew }}</span>
        </div>
        <p class="kpi-value">{{ m.tenantsTotal }}</p>
        <p class="kpi-hint">Total registered</p>
        <svg viewBox="0 0 120 40" class="w-full h-8 mt-3 text-primary-500" preserveAspectRatio="none">
          <path [attr.d]="sparkArea(trends.tenants)" fill="currentColor" opacity="0.12"/>
          <path [attr.d]="spark(trends.tenants)" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- ERP Users -->
      <div class="kpi-card">
        <div class="flex items-start justify-between mb-2">
          <p class="kpi-label">ERP Users</p>
        </div>
        <p class="kpi-value">{{ m.erpUsers }}</p>
        <p class="kpi-hint">Active accounts</p>
        <svg viewBox="0 0 120 40" class="w-full h-8 mt-3 text-violet-500" preserveAspectRatio="none">
          <path [attr.d]="sparkArea(trends.users)" fill="currentColor" opacity="0.12"/>
          <path [attr.d]="spark(trends.users)" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Blocked -->
      <div class="kpi-card">
        <div class="flex items-start justify-between mb-2">
          <p class="kpi-label">Blocked</p>
          @if (m.blockedUsers > 0) {
            <span class="kpi-badge kpi-badge--red">⚠ {{ m.blockedUsers }}</span>
          } @else {
            <span class="kpi-badge kpi-badge--green">✓</span>
          }
        </div>
        <p class="kpi-value">{{ m.blockedUsers }}</p>
        <p class="kpi-hint">Blocked users</p>
        <svg viewBox="0 0 120 40" class="w-full h-8 mt-3 text-rose-400" preserveAspectRatio="none">
          <path [attr.d]="sparkArea(trends.blocked)" fill="currentColor" opacity="0.12"/>
          <path [attr.d]="spark(trends.blocked)" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- DB Instances -->
      <div class="kpi-card">
        <div class="flex items-start justify-between mb-2">
          <p class="kpi-label">Instances DB</p>
          <span class="kpi-badge kpi-badge--teal">{{ m.dbInstancesActive }} active</span>
        </div>
        <p class="kpi-value">{{ m.dbInstancesActive + m.dbInstancesInactive }}</p>
        <p class="kpi-hint">Total PostgreSQL</p>
        <svg viewBox="0 0 120 40" class="w-full h-8 mt-3 text-teal-500" preserveAspectRatio="none">
          <path [attr.d]="sparkArea(trends.dbActive)" fill="currentColor" opacity="0.12"/>
          <path [attr.d]="spark(trends.dbActive)" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>

    </div><!-- /KPI row -->

    <!-- ─── Analytics Row ─────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Main activity chart -->
      <div class="lg:col-span-2 analytics-card">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h3 class="text-base font-semibold text-default">Platform activity</h3>
            <p class="text-sm text-secondary mt-0.5">Monthly trends — tenants &amp; ERP users</p>
          </div>
          <!-- Period tabs -->
          <div class="flex rounded-lg overflow-hidden border self-start" style="border-color:rgba(var(--fuse-border-rgb),.15)">
            @for (period of chartPeriods; track period.key) {
              <button
                class="px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer border-0 focus:outline-none"
                [class.bg-primary-500]="activeChartPeriod === period.key"
                [class.text-white]="activeChartPeriod === period.key"
                [class.text-secondary]="activeChartPeriod !== period.key"
                [class.hover:bg-gray-50]="activeChartPeriod !== period.key"
                [class.dark:hover:bg-gray-800]="activeChartPeriod !== period.key"
                (click)="activeChartPeriod = period.key">
                {{ period.label }}
              </button>
            }
          </div>
        </div>

        <!-- SVG chart -->
        <svg viewBox="0 0 600 160" class="w-full" style="height:160px" preserveAspectRatio="none">
          <!-- Grid lines -->
          <line x1="0" y1="32" x2="600" y2="32" stroke="rgba(148,163,184,.15)" stroke-width="1"/>
          <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(148,163,184,.15)" stroke-width="1"/>
          <line x1="0" y1="128" x2="600" y2="128" stroke="rgba(148,163,184,.15)" stroke-width="1"/>
          <!-- Users (indigo) -->
          <path [attr.d]="mainArea(chartData.users)" fill="#6366f1" opacity="0.06"/>
          <path [attr.d]="mainLine(chartData.users)" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Tenants (teal) -->
          <path [attr.d]="mainArea(chartData.tenants)" fill="#0d9488" opacity="0.08"/>
          <path [attr.d]="mainLine(chartData.tenants)" fill="none" stroke="#0d9488" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Dots at data points — users -->
          @for (v of chartData.users; track $index) {
            <circle [attr.cx]="dotX($index, chartData.users.length, 600)"
                    [attr.cy]="dotY(v, chartData.users, 160)"
                    r="3" fill="#6366f1"/>
          }
          <!-- Dots at data points — tenants -->
          @for (v of chartData.tenants; track $index) {
            <circle [attr.cx]="dotX($index, chartData.tenants.length, 600)"
                    [attr.cy]="dotY(v, chartData.tenants, 160)"
                    r="3" fill="#0d9488"/>
          }
        </svg>

        <!-- X-axis months + legend -->
        <div class="mt-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-5">
            <div class="flex items-center gap-2">
              <span class="w-7 h-0.5 rounded bg-primary-500 inline-block"></span>
              <span class="text-xs text-secondary">ERP Users</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-7 h-0.5 rounded bg-teal-500 inline-block"></span>
              <span class="text-xs text-secondary">Tenants</span>
            </div>
          </div>
          <div class="hidden lg:flex gap-0 flex-1 justify-around">
            @for (mo of months; track $index) {
              <span class="text-[10px] text-secondary">{{ mo }}</span>
            }
          </div>
        </div>
      </div>

      <!-- DB Donut -->
      <div class="analytics-card">
        <h3 class="text-base font-semibold text-default">DB breakdown</h3>
        <p class="text-sm text-secondary mt-0.5 mb-6">PostgreSQL instances</p>

        <!-- SVG donut (r=15.9155, circ≈100) -->
        <div class="flex justify-center mb-6">
          <div class="relative w-44 h-44">
            <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none"
                      stroke="rgba(148,163,184,.2)" stroke-width="2.8"/>
              <circle cx="18" cy="18" r="15.9155" fill="none"
                      stroke="#0d9488" stroke-width="2.8"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="donutDash(dbPct(m))"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-extrabold text-default">{{ dbPct(m) }}%</span>
              <span class="text-xs text-secondary font-medium">active</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="space-y-2 mb-5">
          <div class="flex items-center justify-between py-2.5 border-b" style="border-color:rgba(var(--fuse-border-rgb),.1)">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0"></span>
              <span class="text-sm text-default">Active</span>
            </div>
            <span class="text-base font-bold text-default">{{ m.dbInstancesActive }}</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></span>
              <span class="text-sm text-default">Inactive</span>
            </div>
            <span class="text-base font-bold text-default">{{ m.dbInstancesInactive }}</span>
          </div>
        </div>

        <!-- Mini progress bars -->
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-secondary">DB usage</span>
              <span class="font-semibold text-teal-600">{{ dbPct(m) }}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill bg-teal-500" [style.width]="dbPct(m) + '%'"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-secondary">Blocked users</span>
              <span class="font-semibold" [class.text-rose-500]="blockedPct(m) > 0" [class.text-emerald-600]="blockedPct(m) === 0">{{ blockedPct(m) }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [class.bg-rose-400]="blockedPct(m) > 0" [class.bg-emerald-500]="blockedPct(m) === 0" [style.width]="blockedPct(m) + '%'"></div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /analytics row -->

    <!-- ─── Bottom Row ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

      <!-- Alerts grid -->
      <div class="lg:col-span-3 analytics-card">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-base font-semibold text-default">System alerts</h3>
            <p class="text-sm text-secondary mt-0.5">Events requiring attention</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full"
                [class.bg-rose-100]="m.alerts.length > 0"
                [class.text-rose-600]="m.alerts.length > 0"
                [class.dark:bg-rose-900\/30]="m.alerts.length > 0"
                [class.dark:text-rose-400]="m.alerts.length > 0"
                [class.bg-emerald-100]="m.alerts.length === 0"
                [class.text-emerald-700]="m.alerts.length === 0">
            {{ m.alerts.length === 0 ? '✓ No alerts' : m.alerts.length + ' alert(s)' }}
          </span>
        </div>
        <kendo-grid [data]="buildAlerts(m.alerts)" [height]="220" class="rounded-xl overflow-hidden">
          <kendo-grid-column field="message" title="Message" [sortable]="false"></kendo-grid-column>
        </kendo-grid>
      </div>

      <!-- Platform health -->
      <div class="lg:col-span-2 analytics-card">
        <h3 class="text-base font-semibold text-default mb-1">Platform health</h3>
        <p class="text-sm text-secondary mb-6">Key indicators</p>
        <div class="space-y-5">
          @for (stat of healthStats(m); track stat.label) {
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-default">{{ stat.label }}</span>
                <span class="text-sm font-bold" [class]="stat.valueClass">{{ stat.value }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill transition-all duration-700" [class]="stat.barClass" [style.width]="stat.pct + '%'"></div>
              </div>
              <p class="text-xs text-secondary mt-1">{{ stat.hint }}</p>
            </div>
          }
        </div>
      </div>

    </div><!-- /bottom row -->

  } @else {
    <!-- Loading skeletons -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      @for (_ of [1,2,3,4]; track $index) {
        <div class="kpi-card animate-pulse">
          <div class="h-2.5 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
          <div class="h-8 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
          <div class="h-2 w-20 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
          <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded mt-3"></div>
        </div>
      }
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 analytics-card animate-pulse h-80"></div>
      <div class="analytics-card animate-pulse h-80"></div>
    </div>
  }

</div>
`,
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly metrics$ = this.store.select(DashboardSelectors.selectMetrics);

  activeChartPeriod = "12m";

  readonly chartPeriods = [
    { key: "7d",  label: "7 d" },
    { key: "30d", label: "30 d" },
    { key: "12m", label: "12 m" },
  ];

  readonly months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /** Simulated 12-month trend data for sparklines (deterministic, visual only) */
  readonly trends = {
    tenants:  [5, 6, 5, 7, 6, 7, 8, 9, 8, 10,  9, 10],
    users:    [30, 35, 32, 38, 36, 42, 40, 45, 43, 50, 48, 52],
    blocked:  [2, 1, 2, 3, 2, 1, 2, 1, 3, 2, 1, 2],
    dbActive: [2, 2, 3, 2, 3, 3, 4, 3, 4, 4, 5, 4],
  };

  /** Simulated monthly activity data for main chart */
  readonly chartData = {
    tenants: [5, 6, 5, 7, 6, 7, 8, 9, 8, 10,  9, 10],
    users:   [30, 35, 32, 38, 36, 42, 40, 45, 43, 50, 48, 52],
  };

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadDashboard());
  }

  buildAlerts(alerts: string[]): { message: string }[] {
    return (alerts ?? []).map(message => ({ message }));
  }

  /** SVG path for a sparkline line (viewBox 0 0 120 40) */
  spark(values: number[], w = 120, h = 40, pad = 5): string {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const uh = h - pad * 2;
    return values.map((v, i) => {
      const x = (i * step).toFixed(2);
      const y = (h - pad - ((v - min) / range) * uh).toFixed(2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }

  sparkArea(values: number[], w = 120, h = 40): string {
    return `${this.spark(values, w, h)} L ${w} ${h} L 0 ${h} Z`;
  }

  /** SVG path for main chart line (viewBox 0 0 600 160) */
  mainLine(values: number[], w = 600, h = 160, pad = 16): string {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const uh = h - pad * 2;
    return values.map((v, i) => {
      const x = (i * step).toFixed(2);
      const y = (h - pad - ((v - min) / range) * uh).toFixed(2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }

  mainArea(values: number[], w = 600, h = 160, pad = 16): string {
    return `${this.mainLine(values, w, h, pad)} L ${w} ${h} L 0 ${h} Z`;
  }

  /** X coordinate of the i-th dot on the main chart */
  dotX(i: number, total: number, w = 600): number {
    return i * (w / (total - 1));
  }

  /** Y coordinate of a value on the main chart */
  dotY(value: number, series: number[], h = 160, pad = 16): number {
    const max = Math.max(...series);
    const min = Math.min(...series);
    const range = max - min || 1;
    return h - pad - ((value - min) / range) * (h - pad * 2);
  }

  /** Donut chart stroke-dasharray (circle r=15.9155, circumference≈100) */
  donutDash(pct: number): string {
    const p = Math.min(100, Math.max(0, pct));
    return `${p.toFixed(1)} ${(100 - p).toFixed(1)}`;
  }

  dbPct(m: DashboardMetrics): number {
    const total = m.dbInstancesActive + m.dbInstancesInactive;
    return total === 0 ? 100 : Math.round((m.dbInstancesActive / total) * 100);
  }

  blockedPct(m: DashboardMetrics): number {
    return m.erpUsers === 0 ? 0 : Math.round((m.blockedUsers / m.erpUsers) * 100);
  }

  healthStats(m: DashboardMetrics): HealthStat[] {
    const total = m.dbInstancesActive + m.dbInstancesInactive;
    const dbP = total === 0 ? 100 : Math.round((m.dbInstancesActive / total) * 100);
    const blkP = m.erpUsers === 0 ? 0 : Math.round((m.blockedUsers / m.erpUsers) * 100);
    const tenP = Math.min(100, m.tenantsTotal * 10);
    const alertP = m.alerts.length === 0 ? 100 : Math.max(10, 100 - m.alerts.length * 25);

    return [
      {
        label: "Operational DBs",
        value: `${dbP}%`,
        hint: `${m.dbInstancesActive} active out of ${total}`,
        pct: dbP,
        valueClass: dbP >= 80 ? "text-emerald-600" : "text-amber-500",
        barClass: dbP >= 80 ? "bg-emerald-500" : "bg-amber-400",
      },
      {
        label: "Block rate",
        value: `${blkP}%`,
        hint: `${m.blockedUsers} blocked user(s)`,
        pct: blkP,
        valueClass: blkP > 0 ? "text-rose-500" : "text-emerald-600",
        barClass: blkP > 0 ? "bg-rose-400" : "bg-emerald-500",
      },
      {
        label: "Tenant activity",
        value: m.tenantsTotal > 0 ? "Active" : "Empty",
        hint: `${m.tenantsTotal} registered tenant(s)`,
        pct: tenP,
        valueClass: "text-primary-500",
        barClass: "bg-primary-500",
      },
      {
        label: "Overall health",
        value: m.alerts.length === 0 ? "Optimal" : "Degraded",
        hint: `${m.alerts.length} active alert(s)`,
        pct: alertP,
        valueClass: alertP >= 80 ? "text-emerald-600" : "text-amber-500",
        barClass: alertP >= 80 ? "bg-emerald-500" : "bg-amber-400",
      },
    ];
  }
}

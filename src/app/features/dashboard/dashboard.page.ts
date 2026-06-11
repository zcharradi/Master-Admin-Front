import { AsyncPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { GridModule } from "@progress/kendo-angular-grid";

import { DashboardMetrics } from "./reducers";
import * as DashboardActions from "./actions";
import * as DashboardSelectors from "./reducers";

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
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
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

  readonly trends = {
    tenants:  [5, 6, 5, 7, 6, 7, 8, 9, 8, 10,  9, 10],
    users:    [30, 35, 32, 38, 36, 42, 40, 45, 43, 50, 48, 52],
    blocked:  [2, 1, 2, 3, 2, 1, 2, 1, 3, 2, 1, 2],
    dbActive: [2, 2, 3, 2, 3, 3, 4, 3, 4, 4, 5, 4],
  };

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

  dotX(i: number, total: number, w = 600): number {
    return i * (w / (total - 1));
  }

  dotY(value: number, series: number[], h = 160, pad = 16): number {
    const max = Math.max(...series);
    const min = Math.min(...series);
    const range = max - min || 1;
    return h - pad - ((value - min) / range) * (h - pad * 2);
  }

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

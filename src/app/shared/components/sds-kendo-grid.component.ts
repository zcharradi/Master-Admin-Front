/*import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { DataStateChangeEvent, GridDataResult, GridModule } from "@progress/kendo-angular-grid";
import { State } from "@progress/kendo-data-query";

export interface GridSettings {
  gridData: GridDataResult;
  state: State;
}

export interface GridOptions {
  toolbar?: boolean;
}

@Component({
  selector: "sds-kendo-grid",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, GridModule, ButtonsModule],
  styles: [
    `
      .sds-grid {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: var(--surface);
      }

      .sds-grid__toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid var(--border);
        background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
      }
    `,
  ],
  template: `
    <div class="sds-grid">
      <div class="sds-grid__toolbar" *ngIf="showToolbar">
        <div class="text-sm text-theme-muted">{{ title || "List" }}</div>
        <div class="flex items-center gap-2">
          <button kendoButton fillMode="flat" icon="reload" (click)="onRefresh()" [disabled]="loading">
            Refresh
          </button>
        </div>
      </div>

      <kendo-grid
        [data]="currentGridData"
        [height]="height"
        [pageSize]="currentState.take"
        [skip]="currentState.skip"
        [sort]="currentState.sort"
        [group]="currentState.group"
        [filter]="currentState.filter"
        [sortable]="sortable"
        [groupable]="groupable"
        [filterable]="filterable ? 'menu' : false"
        [pageable]="pageable"
        [resizable]="resizable"
        [reorderable]="reorderable"
        [loading]="loading"
        (dataStateChange)="onStateChange($event)"
      >
        <ng-content></ng-content>
      </kendo-grid>
    </div>
  `,
})
export class SdsKendoGridComponent {
  @Input() data: GridDataResult = { data: [], total: 0 };
  @Input() gridSettings: GridSettings | null = null;
  @Input() state: State = { skip: 0, take: 10, filter: { logic: "and", filters: [] } };
  @Input() height = 420;
  @Input() loading = false;
  @Input() showToolbar = true;
  @Input() sortable = true;
  @Input() groupable = false;
  @Input() filterable = true;
  @Input() pageable = true;
  @Input() resizable = true;
  @Input() reorderable = true;
  @Input() name?: string;
  @Input() options: GridOptions = { toolbar: true };
  @Input() title?: string;

  @Output() stateChange = new EventEmitter<State>();
  @Output() refresh = new EventEmitter<void>();
  @Output() settings = new EventEmitter<GridSettings>();
  @Output() extraCommand = new EventEmitter<any>();

  onStateChange(event: DataStateChangeEvent): void {
    const nextState: State = { ...this.currentState, ...event };
    this.stateChange.emit(nextState);
    this.settings.emit({ gridData: this.currentGridData, state: nextState });
  }

  onRefresh(): void {
    this.refresh.emit();
    this.extraCommand.emit({ type: "refresh" });
  }

  get currentState(): State {
    return this.gridSettings?.state ?? this.state;
  }

  get currentGridData(): GridDataResult {
    return this.gridSettings?.gridData ?? this.data ?? { data: [], total: 0 };
  }
}*/





import { NgTemplateOutlet, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";

import { ButtonsModule } from "@progress/kendo-angular-buttons";
import {
  DataStateChangeEvent,
  GridDataResult,
  GridModule
} from "@progress/kendo-angular-grid";

import { State } from "@progress/kendo-data-query";

export interface GridSettings {
  gridData: GridDataResult;
  state: State;
}

@Component({
  selector: "sds-kendo-grid",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, NgIf, GridModule, ButtonsModule],
  template: `
    <div class="sds-grid">

      <!-- Toolbar -->
      @if (showToolbar) {
        <div class="sds-grid__toolbar">
          <div class="sds-grid__title">
            {{ title }}
          </div>

          <button kendoButton fillMode="flat" (click)="refresh.emit()">
            Refresh
          </button>
        </div>
      }

      <!-- GRID -->
      <kendo-grid
        [data]="grid"
        [height]="height"
        [pageSize]="state.take"
        [skip]="state.skip"
        [sort]="state.sort"
        [filter]="state.filter"
        [sortable]="true"
        [pageable]="true"
        (dataStateChange)="handleStateChange($event)"
      >
        <ng-content></ng-content>
      </kendo-grid>

    </div>
  `,
  styles: [`
    .sds-grid {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      background: white;
    }

    .sds-grid__toolbar {
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:10px 12px;
      border-bottom:1px solid #eee;
      background:#fafafa;
    }

    .sds-grid__title {
      font-weight: 600;
      font-size: 14px;
    }
  `]
})
export class SdsKendoGridComponent {

  // INPUTS
  @Input() data: GridDataResult = { data: [], total: 0 };
  @Input() gridSettings: GridSettings | null = null;

  @Input() state: State = { skip: 0, take: 10 };
  @Input() height = 420;

  @Input() showToolbar = true;
  @Input() title = "";

  // OUTPUTS
  @Output() stateChange = new EventEmitter<State>();
  @Output() refresh = new EventEmitter<void>();

  // STATE HANDLING
  handleStateChange(event: DataStateChangeEvent): void {
    this.stateChange.emit({
      ...this.state,
      ...event
    });
  }

  // SINGLE SOURCE OF TRUTH
  get grid(): GridDataResult {
    const source =
      this.gridSettings?.gridData ??
      this.data ??
      { data: [], total: 0 };

    return {
      data: Array.isArray(source.data) ? [...source.data] : [],
      total: source.total ?? 0
    };
  }
}

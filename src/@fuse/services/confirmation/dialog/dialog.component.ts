import { NgClass, NgIf } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface FuseDialogData {
    title?: string;
    message?: string;
    icon: {
        show: boolean;
        name: string;
        color: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
    };
    actions: {
        confirm: { show: boolean; label: string; color: 'primary' | 'accent' | 'warn' };
        cancel: { show: boolean; label: string };
    };
    dismissible: boolean;
}

@Component({
    selector: 'fuse-confirmation-dialog',
    templateUrl: './dialog.component.html',
    styles: [`
        .fuse-confirmation-dialog-panel {
            @screen md { @apply w-128; }
            .mat-mdc-dialog-container .mat-mdc-dialog-surface { padding: 0 !important; }
        }
    `],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatDialogModule, MatIconModule, NgClass],
})
export class FuseConfirmationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: FuseDialogData) {}
}

import { EnvironmentProviders, Provider } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { APP_INITIALIZER } from '@angular/core';

export const provideIcons = (): Array<Provider | EnvironmentProviders> => [
    {
        provide: APP_INITIALIZER,
        useFactory: (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => () => {
            iconRegistry.addSvgIconSet(
                sanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-outline.svg')
            );
            iconRegistry.addSvgIconSetInNamespace(
                'heroicons_outline',
                sanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-outline.svg')
            );
            iconRegistry.addSvgIconSetInNamespace(
                'heroicons_solid',
                sanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-solid.svg')
            );
            iconRegistry.addSvgIconSetInNamespace(
                'heroicons_mini',
                sanitizer.bypassSecurityTrustResourceUrl('icons/heroicons-mini.svg')
            );
            iconRegistry.addSvgIconSetInNamespace(
                'mat_outline',
                sanitizer.bypassSecurityTrustResourceUrl('icons/material-outline.svg')
            );
        },
        deps: [MatIconRegistry, DomSanitizer],
        multi: true,
    },
];

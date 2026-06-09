import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FUSE_MOCK_API_DEFAULT_DELAY, mockApiInterceptor } from '@fuse/lib/mock-api';
import { FuseConfig } from '@fuse/services/config';
import { FUSE_CONFIG } from '@fuse/services/config/config.constants';
import { fuseLoadingInterceptor, FuseLoadingService } from '@fuse/services/loading';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FusePlatformService } from '@fuse/services/platform';
import { FuseSplashScreenService } from '@fuse/services/splash-screen';
import { FuseUtilsService } from '@fuse/services/utils';

export type FuseProviderConfig = {
    mockApi?: {
        delay?: number;
        services?: any[];
    };
    fuse?: FuseConfig;
};

export const provideFuse = (config: FuseProviderConfig): Array<Provider | EnvironmentProviders> => {
    const providers: Array<Provider | EnvironmentProviders> = [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'fill' },
        },
        {
            provide: FUSE_MOCK_API_DEFAULT_DELAY,
            useValue: config?.mockApi?.delay ?? 0,
        },
        {
            provide: FUSE_CONFIG,
            useValue: config?.fuse ?? {},
        },
        provideHttpClient(withInterceptors([fuseLoadingInterceptor])),
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(FuseLoadingService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(FuseMediaWatcherService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(FusePlatformService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(FuseSplashScreenService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(FuseUtilsService),
            multi: true,
        },
    ];

    if (config?.mockApi?.services) {
        providers.push(
            provideHttpClient(withInterceptors([mockApiInterceptor])),
            {
                provide: APP_INITIALIZER,
                deps: [...config.mockApi.services],
                useFactory: () => (): null => null,
                multi: true,
            },
        );
    }

    return providers;
};

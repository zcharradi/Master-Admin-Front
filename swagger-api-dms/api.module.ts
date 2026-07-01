import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { ActivitiesService } from './api/activities.service';
import { ArticleService } from './api/article.service';
import { DepartmentService } from './api/department.service';
import { TranslationService } from './api/translation.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class DmsApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<DmsApiModule> {
        return {
            ngModule: DmsApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: DmsApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('DmsApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}

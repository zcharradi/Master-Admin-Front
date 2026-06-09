import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FusePlatformService } from '@fuse/services/platform';
import { combineLatest, filter, map, Subject, takeUntil } from 'rxjs';
import { EmptyLayoutComponent } from './layouts/empty/empty.component';
import { ClassyLayoutComponent } from './layouts/vertical/classy/classy.component';
import { Store } from '@ngrx/store';
import { selectUser } from 'app/features/auth/+state/auth.selectors';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'layout',
    template: `
        @if (layout === 'empty') {
            <empty-layout></empty-layout>
        } @else {
            <classy-layout></classy-layout>
        }
    `,
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [EmptyLayoutComponent, ClassyLayoutComponent],
})
export class LayoutComponent implements OnInit, OnDestroy {
    config!: FuseConfig;
    layout = 'classy';
    scheme: 'dark' | 'light' = 'light';
    theme = 'theme-default';
    private _unsub = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        @Inject(DOCUMENT) private _document: Document,
        private _renderer2: Renderer2,
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fusePlatformService: FusePlatformService,
        private _store: Store,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        // Sync auth user → UserService
        this._store.select(selectUser).pipe(takeUntil(this._unsub)).subscribe((profile) => {
            if (profile) {
                this._userService.user = {
                    id: String(profile.id ?? ''),
                    name: profile.fullName ?? profile.userName ?? profile.email ?? 'Utilisateur',
                    email: profile.email ?? '',
                };
            }
        });

        // Theme + scheme
        combineLatest([
            this._fuseConfigService.config$,
            this._fuseMediaWatcherService.onMediaQueryChange$([
                '(prefers-color-scheme: dark)',
                '(prefers-color-scheme: light)',
            ]),
        ]).pipe(
            takeUntil(this._unsub),
            map(([config, mql]) => ({
                scheme: config.scheme === 'auto'
                    ? (mql.breakpoints['(prefers-color-scheme: dark)'] ? 'dark' : 'light')
                    : config.scheme,
                theme: config.theme,
            })),
        ).subscribe(({ scheme, theme }) => {
            this.scheme = scheme as 'dark' | 'light';
            this.theme = theme;
            this._updateScheme();
            this._updateTheme();
        });

        // Config → layout
        this._fuseConfigService.config$.pipe(takeUntil(this._unsub)).subscribe((config) => {
            this.config = config;
            this._updateLayout();
        });

        // Navigate → re-check layout override
        this._router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            takeUntil(this._unsub),
        ).subscribe(() => this._updateLayout());

        // OS class
        this._renderer2.addClass(this._document.body, this._fusePlatformService.osName);
    }

    ngOnDestroy(): void {
        this._unsub.next();
        this._unsub.complete();
    }

    private _updateLayout(): void {
        let route = this._activatedRoute;
        while (route.firstChild) route = route.firstChild;

        this.layout = this.config?.layout ?? 'classy';

        const layoutFromParam = route.snapshot.queryParamMap.get('layout');
        if (layoutFromParam) this.layout = layoutFromParam;

        route.pathFromRoot.forEach((path) => {
            if (path.routeConfig?.data?.['layout']) {
                this.layout = path.routeConfig.data['layout'];
            }
        });
    }

    private _updateScheme(): void {
        this._document.body.classList.remove('light', 'dark');
        this._document.body.classList.add(this.scheme);
    }

    private _updateTheme(): void {
        this._document.body.classList.forEach((cls: string) => {
            if (cls.startsWith('theme-')) this._document.body.classList.remove(cls);
        });
        this._document.body.classList.add(this.theme);
    }
}

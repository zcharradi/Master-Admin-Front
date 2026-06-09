import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseConfigService } from '@fuse/services/config';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { AuthFacade } from 'app/features/auth/+state/auth.facade';
import { Router } from '@angular/router';

interface AppNotification {
    title: string;
    time: string;
    icon: string;
}

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        FuseDrawerComponent,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        MatDividerModule,
        RouterOutlet,
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    @ViewChild('settingsDrawer') settingsDrawer!: FuseDrawerComponent;

    isScreenSmall = false;
    navigation!: Navigation;
    user!: User;

    activeLanguage = 'fr';
    currentScheme = 'light';
    currentTheme = 'theme-default';

    readonly languages = [
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    ];

    readonly schemes = [
        { value: 'light', label: 'Light', icon: 'heroicons_outline:sun' },
        { value: 'dark',  label: 'Dark',  icon: 'heroicons_outline:moon' },
        { value: 'auto',  label: 'Auto',  icon: 'heroicons_outline:computer-desktop' },
    ];

    readonly themeColors = [
        { id: 'theme-default', color: '#4f46e5', label: 'Indigo' },
        { id: 'theme-brand',   color: '#2196f3', label: 'Blue' },
        { id: 'theme-teal',    color: '#0d9488', label: 'Teal' },
        { id: 'theme-rose',    color: '#f43f5e', label: 'Rose' },
        { id: 'theme-purple',  color: '#9333ea', label: 'Purple' },
        { id: 'theme-amber',   color: '#f59e0b', label: 'Amber' },
    ];

    readonly notifications: AppNotification[] = [];

    get notificationCount(): number {
        return this.notifications.length;
    }

    get activeLangFlag(): string {
        return this.languages.find(l => l.code === this.activeLanguage)?.flag ?? '🌐';
    }

    private _unsub = new Subject<void>();

    constructor(
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseConfigService: FuseConfigService,
        private _authFacade: AuthFacade,
        private _router: Router,
    ) {}

    get currentYear(): number {
        return new Date().getFullYear();
    }

    ngOnInit(): void {
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsub))
            .subscribe(nav => (this.navigation = nav));

        this._userService.user$
            .pipe(takeUntil(this._unsub))
            .subscribe(user => (this.user = user));

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsub))
            .subscribe(({ matchingAliases }) => {
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsub))
            .subscribe(config => {
                this.currentScheme = config.scheme ?? 'light';
                this.currentTheme = config.theme ?? 'theme-default';
            });

        // Restore persisted theme & scheme
        const savedScheme = localStorage.getItem('master_scheme');
        const savedTheme  = localStorage.getItem('master_theme');
        if (savedScheme || savedTheme) {
            this._fuseConfigService.config = {
                ...(savedScheme ? { scheme: savedScheme } : {}),
                ...(savedTheme  ? { theme:  savedTheme  } : {}),
            };
        }

        const savedLang = localStorage.getItem('master_lang');
        if (savedLang) this.activeLanguage = savedLang;
    }

    ngOnDestroy(): void {
        this._unsub.next();
        this._unsub.complete();
    }

    toggleNavigation(name: string): void {
        const nav = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
        if (nav) nav.toggle();
    }

    setLanguage(code: string): void {
        this.activeLanguage = code;
        localStorage.setItem('master_lang', code);
    }

    setScheme(scheme: string): void {
        this._fuseConfigService.config = { scheme };
        localStorage.setItem('master_scheme', scheme);
    }

    setTheme(theme: string): void {
        this._fuseConfigService.config = { theme };
        localStorage.setItem('master_theme', theme);
    }

    logout(): void {
        this._authFacade.logout();
        this._router.navigate(['/login']);
    }
}

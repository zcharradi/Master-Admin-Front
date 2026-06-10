import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard',
    },
    {
        id: 'administration',
        title: 'Administration',
        subtitle: 'Platform management',
        type: 'group',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'tenants',
                title: 'Clients',
                type: 'basic',
                icon: 'heroicons_outline:building-office-2',
                link: '/tenants',
            },
            {
                id: 'db-instances',
                title: 'DB Instances',
                type: 'basic',
                icon: 'heroicons_outline:circle-stack',
                link: '/db-instances',
            },
            {
                id: 'erp-users',
                title: 'ERP Users',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/erp-users',
            },
            {
                id: 'master-admins',
                title: 'Administrators',
                type: 'basic',
                icon: 'heroicons_outline:shield-check',
                link: '/master-admins',
            },{
            id: 'global-config',
            title: 'Global config',
            type: 'basic',
            icon: 'heroicons_outline:adjustments-horizontal',
            link: '/global-config',
          },
          {
            id: 'industries',
            title: 'Industries',
            type: 'basic',
            icon: 'heroicons_outline:building-storefront',
            link: '/industries',
          },
          {
            id: 'references',
            title: 'References',
            type: 'basic',
            icon: 'heroicons_outline:bookmark',
            link: '/references',
          },
        ],
    },
    {
        id: 'configuration',
        title: 'Configuration',
        type: 'group',
        icon: 'heroicons_outline:wrench-screwdriver',
        children: [

        ],
    },
];

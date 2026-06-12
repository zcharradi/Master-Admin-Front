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
    id: 'master-data',
    title: 'Master Data',
    type: 'group',
    icon: 'heroicons_outline:circle-stack',
    children: [
        {
            id: 'operations',
            title: 'Operations',
            type: 'collapsable',   
            icon: 'heroicons_outline:cog-6-tooth',
            link: '/operations',
            children: [
                {
                    id: 'operations-translation',
                    title: 'Translation',
                    type: 'basic',
                    icon: 'heroicons_outline:language',
                    link: '/operations/translation',
                }
            ]
        },
        {
            id: 'articles',
            title: 'Articles',
            type: 'collapsable',
            icon: 'heroicons_outline:document-text',
            link: '/articles',
            children: [
                {
                    id: 'articles-translation',
                    title: 'Translation',
                    type: 'basic',
                    icon: 'heroicons_outline:language',
                    link: '/articles/translation',
                }
            ]
        },
        {
            id: 'chart-of-accounts',
            title: 'Chart of Accounts',
            type: 'collapsable',
            icon: 'heroicons_outline:book-open',
            link: '/chart-of-accounts',
            children: [
                {
                    id: 'chart-of-accounts-translation',
                    title: 'Translation',
                    type: 'basic',
                    icon: 'heroicons_outline:language',
                    link: '/chart-of-accounts/translation',
                }
            ]
        },
        {
            id: 'vat',
            title: 'VAT / TVA',
            type: 'collapsable',
            icon: 'heroicons_outline:receipt-percent',
            link: '/vat',
            children: [
                {
                    id: 'vat-translation',
                    title: 'Translation',
                    type: 'basic',
                    icon: 'heroicons_outline:language',
                    link: '/vat/translation',
                }
            ]
        },
        {
            id: 'documents',
            title: 'Documents',
            type: 'collapsable',
            icon: 'heroicons_outline:document-text',
            link: '/documents',
            children: [
                {
                    id: 'documents-translation',
                    title: 'Translation',
                    type: 'basic',
                    icon: 'heroicons_outline:language',
                    link: '/documents/translation',
                }
            ]
        },
    ],
},
];

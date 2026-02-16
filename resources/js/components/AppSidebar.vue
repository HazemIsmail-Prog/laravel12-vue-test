<script setup lang="ts">
    import LanguageSwitcher from './LanguageSwitcher.vue';
    import { LayoutGrid, Users } from 'lucide-vue-next';
    import NavFooter from '@/components/NavFooter.vue';
    import NavMain from '@/components/NavMain.vue';
    import NavUser from '@/components/NavUser.vue';
    import { type NavItem } from '@/types';
    import { Link } from '@inertiajs/vue3';
    import { dashboard } from '@/routes';
    import AppLogo from './AppLogo.vue';
    import { useI18n } from 'vue-i18n';
    import {
        Sidebar,
        SidebarContent,
        SidebarFooter,
        SidebarHeader,
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
    } from '@/components/ui/sidebar';

    const { t } = useI18n();

    const mainNavItems: NavItem[] = [
        {
            title: t('Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('Users'),
            href: '/users',
            icon: Users,
        },
    ];

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Github Repo',
        //     href: 'https://github.com/laravel/vue-starter-kit',
        //     icon: Folder,
        // },
        // {
        //     title: 'Documentation',
        //     href: 'https://laravel.com/docs/starter-kits#vue',
        //     icon: BookOpen,
        // },
    ];

    const { locale } = useI18n();

    const appLocale = locale.value;

    </script>

    <template>
        <Sidebar :side="appLocale === 'ar' ? 'right' : 'left'" collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" as-child>
                            <Link :href="dashboard()">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain :items="mainNavItems" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter :items="footerNavItems" />
                <LanguageSwitcher />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
        <slot />
    </template>

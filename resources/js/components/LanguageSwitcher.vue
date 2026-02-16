<script setup lang="ts">
    import { Avatar, AvatarFallback } from '@/components/ui/avatar';
    import { ChevronsUpDown } from 'lucide-vue-next';
    import { router } from '@inertiajs/vue3';
    import { Check } from 'lucide-vue-next';
    import { useI18n } from 'vue-i18n';
    import { computed } from 'vue';

    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';

    import {
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
        useSidebar,
    } from '@/components/ui/sidebar';

    import {
        DropdownMenuGroup,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
    } from '@/components/ui/dropdown-menu';



    const { t } = useI18n();
    const { isMobile, state } = useSidebar();
    const languages = [
        {
            code: 'en',
            name: t('English'),
        },
        {
            code: 'ar',
            name: t('Arabic'),
        },
        
    ];
    const currentLocale = localStorage.getItem('locale') || import.meta.env.VITE_APP_LOCALE || 'en';



    const changeLocale = (locale: string) => {
        // if (locale === localStorage.getItem('locale')) {
        //     return;
        // }
        console.log('pass');
        router.get('/lang/' + locale);
        localStorage.setItem('locale', locale);
        window.location.reload();
    }

    const currentLanguage = computed(() => {
        return languages.find(language => language.code === currentLocale);
    });

    

    </script>

    <template>
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <SidebarMenuButton
                            size="lg"
                            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            data-test="sidebar-menu-button"
                        >
                            <Avatar class="h-8 w-8 overflow-hidden rounded-lg">
                                <AvatarFallback class="rounded-lg text-black dark:text-white uppercase">
                                    {{ currentLanguage?.code }}
                                </AvatarFallback>
                            </Avatar>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-medium">{{ $t('Language') }}</span>
                            </div>
                            <ChevronsUpDown class="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        :side="
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                    ? 'left'
                                    : 'bottom'
                        "
                        align="end"
                        :side-offset="4"
                    >
                        <DropdownMenuLabel class="p-0 font-bold">
                            <div class="flex items-center gap-2 px-2 py-1.5 text-sm">
                                {{ $t('Choose Language') }}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem :as-child="true" v-for="(language, index) in languages" :key="language.code">
                                <div class="flex items-center gap-4 w-full ps-4 cursor-pointer" @click="changeLocale(language.code)">
                                    <Avatar class="h-4 w-4 overflow-hidden rounded-lg">
                                        <AvatarFallback class="rounded-lg dark:text-white uppercase text-xs">
                                            {{ language.code }}
                                        </AvatarFallback>
                                    </Avatar>
                                    {{ language.name }}
                                    <span class="flex-1"></span>
                                    <Check v-if="currentLocale === language.code" />
                                </div>
                                <DropdownMenuSeparator v-if="index < languages.length - 1" />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    </template>
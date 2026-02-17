<script setup lang="ts">
    import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
    import { ButtonGroup } from '@/components/ui/button-group';
    import { useIntersectionObserver } from '@vueuse/core';
    import { ref, onMounted, watch, provide } from 'vue';
    import { Spinner } from '@/components/ui/spinner';
    import AppLayout from '@/layouts/AppLayout.vue';
    import { Button } from '@/components/ui/button';
    import { useCrud } from '@/composables/useCrud';
    import { type BreadcrumbItem } from '@/types';
    import { Badge } from '@/components/ui/badge';
    import { Search } from 'lucide-vue-next';
    import { Head } from '@inertiajs/vue3';
    import { User } from '@/types/models';
    import { useI18n } from 'vue-i18n';
    import Form from './Form.vue';
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from '@/components/ui/table';

    const crud= useCrud<User>();
    const { fetch, loadMore, data, total, isFetching, nextPageUrl, destroy , openSheet} = crud;
    provide('sharedCrud', crud);

    const { t } = useI18n();
    const loadMoreRef = ref<HTMLElement | null>(null);
    const filters = ref({ search: '', is_active: 'all' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Users'), href: '/users' },
    ];

    onMounted(() => {
        useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
            if (isIntersecting) loadMore(filters.value);
        });
        fetch('/users', filters.value);
    });

    watch(filters, () => fetch('/users', filters.value), { deep: true });

</script>

<template>
    <Head :title="$t('Users')" />

    <Form />    
    
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

            <!-- Filters Container -->
            <div class="flex flex-col flex-col-reverse md:flex-row justify-end gap-2 items-start md:items-center">

                <InputGroup>
                    <InputGroupInput 
                        type="search" 
                        :placeholder="$t('Search...')" 
                        v-model="filters.search" 
                        :default-value="filters.search"
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">{{ total }} {{ $t('results') }}</InputGroupAddon>
                </InputGroup>

                <ButtonGroup>

                    <Button 
                        @click="filters.is_active = 'all'" 
                        :variant="filters.is_active === 'all' ? 'default' : 'secondary'" 
                        size="sm"
                    >{{ $t('All') }}</Button>

                    <Button 
                        @click="filters.is_active = 'active'" 
                        :variant="filters.is_active === 'active' ? 'default' : 'secondary'" 
                        size="sm"
                    >{{ $t('Active') }}</Button>

                    <Button 
                        @click="filters.is_active = 'inactive'" 
                        :variant="filters.is_active === 'inactive' ? 'default' : 'secondary'" 
                        size="sm"
                    >{{ $t('Inactive') }}</Button>

                </ButtonGroup>

                <Button 
                    class="self-end md:self-center"
                    variant="default" 
                    size="sm" 
                    @click="openSheet(null)"
                >{{ $t('Add User') }}</Button>

            </div>

            
            <Table v-if="data.length > 0 && !isFetching">
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ $t('ID') }}</TableHead>
                        <TableHead>{{ $t('Name') }}</TableHead>
                        <TableHead>{{ $t('Email') }}</TableHead>
                        <TableHead>{{ $t('Is Active') }}</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow 
                        v-for="user in data" 
                        :key="user.id"
                    >
                        <TableCell>{{ user.id }}</TableCell>

                        <TableCell class="font-semibold">{{ user.name }}</TableCell>

                        <TableCell class="text-left">{{ user.email }}</TableCell>

                        <TableCell>
                            <Badge :variant="user.is_active ? 'secondary' : 'destructive'">
                                {{ user.is_active ? $t('Active') : $t('Inactive') }}
                            </Badge>
                        </TableCell>

                        <TableCell class="flex gap-2 justify-end">

                            <Button 
                                variant="outline" 
                                size="sm" 
                                @click="openSheet(user as User)"
                            >{{ $t('Edit') }}</Button>

                            <Button 
                                variant="destructive" 
                                size="sm" 
                                @click="destroy('/users', user.id)"
                            >{{ $t('Delete') }}</Button>

                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div 
                v-else 
                class="flex justify-center items-center h-full"
            >
                <Spinner class="size-10" />
            </div>

            <div 
                v-if="nextPageUrl && !isFetching" 
                class="flex justify-center items-center" 
                ref="loadMoreRef"
            >
                <Spinner class="size-10" />
            </div>

        </div>


    </AppLayout>
</template>

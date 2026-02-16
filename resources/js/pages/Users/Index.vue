<script setup lang="ts">
    import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
    import { ButtonGroup } from '@/components/ui/button-group';
    import { useIntersectionObserver } from '@vueuse/core';
    import { Spinner } from '@/components/ui/spinner';
    import AppLayout from '@/layouts/AppLayout.vue';
    import { Button } from '@/components/ui/button';
    import { type BreadcrumbItem } from '@/types';
    import { Badge } from '@/components/ui/badge';
    import { ref, onMounted, watch } from 'vue';
    import { Search } from 'lucide-vue-next';
    import { Head } from '@inertiajs/vue3';
    import { User } from '@/types/models';
    import { useI18n } from 'vue-i18n';
    import Form from './Form.vue';
    import axios from 'axios';
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from '@/components/ui/table';

    const { t } = useI18n();


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Users'),
            href: '/users',
        },
    ];

    onMounted(() => {

        useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
            if (isIntersecting) {
                loadMore();
            }
        });
        getUsers();
    });

    const formTarget = ref<typeof Form | null>(null);
    const users = ref<User[]>([]);
    const isFetching = ref(false);
    const total = ref(0);
    const nextPageUrl = ref<string | null>(null);
    const currentPage = ref(1);
    const loadMoreRef = ref<HTMLElement | null>(null);
    const filters = ref({
        search: '',
        is_active: 'all',
    });

    watch(() => filters.value.search, (newVal) => {
        getUsers();
    });
    watch(() => filters.value.is_active, (newVal) => {
        getUsers();
    });

    const getUsers = () => {
        isFetching.value = true;
        axios.get('/users', { params: { ...filters.value } })
            .then(response => {
                users.value = response.data.data;
                total.value = response.data.total;
                nextPageUrl.value = response.data.next_page_url;
                currentPage.value = response.data.current_page;
            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                isFetching.value = false;
            });
    };

    const loadMore = () => {    
        if (!nextPageUrl.value) return;
        axios.get(nextPageUrl.value, { params: filters.value }).then(response => {
            const newUsers = response.data.data.filter((user: User) => !users.value.some(u => u.id === user.id));
            users.value.push(...newUsers);
            nextPageUrl.value = response.data.next_page_url;
        });
    };

    const openSheet = (user?: User) => {
        formTarget.value?.openSheet(user);
    };

    const handleUserUpdated = (user: User) => {
        users.value = users.value.map(u => u.id === user.id ? user : u);
    };

    const handleUserCreated = (user: User) => {
        users.value.unshift(user);
        total.value++;
    };
    
    const deleteUser = (user: User) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        axios.delete('/users/' + user.id)
            .then(() => {
                users.value = users.value.filter(u => u.id !== user.id);
                total.value--;
            })
            .catch(error => {
                console.error(error);
            });
    };

</script>

<template>
    <Head :title="$t('Users')" />
    
    <Form 
        ref="formTarget" 
        @user-updated="handleUserUpdated($event as User)"
        @user-created="handleUserCreated($event as User)"
    />

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
                    @click="openSheet()"
                >{{ $t('Add User') }}</Button>

            </div>
            <Table v-if="!isFetching">
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
                        v-for="user in users" 
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
                                @click="openSheet(user)"
                            >{{ $t('Edit') }}</Button>

                            <Button 
                                variant="destructive" 
                                size="sm" 
                                @click="deleteUser(user)"
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

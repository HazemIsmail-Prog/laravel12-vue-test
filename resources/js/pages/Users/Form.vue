<script setup lang="ts">
    import InputError from '@/components/InputError.vue';
    import { Button } from '@/components/ui/button';
    import { Switch } from '@/components/ui/switch';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useForm } from '@inertiajs/vue3';
    import { User } from '@/types/models';
    import { ref } from 'vue';
    import axios from 'axios';
    import {
        Sheet,
        SheetClose,
        SheetContent,
        SheetDescription,
        SheetFooter,
        SheetHeader,
        SheetTitle,
    } from '@/components/ui/sheet';
    import { Spinner } from '@/components/ui/spinner';

    const appLocale = localStorage.getItem('locale') || 'en';
    const form = useForm<User>({
        id: 0,
        name: '',
        email: '',
        is_active: true,
    })
    const open = ref(false);
    const isEditing = ref(false);
    const isSubmitting = ref(false);
    const setFormDefaults = (user?: User | null) => {
        return {
            id: user?.id ?? 0,
            name: user?.name ?? '',
            email: user?.email ?? '',
            is_active: user?.is_active ?? true,
        }
    };

    const openSheet = (user?: User | null) => {
        form.defaults(setFormDefaults(user));
        form.resetAndClearErrors();
        isEditing.value = user ? true : false;
        open.value = true;
    };

    const closeSheet = () => {
        open.value = false;
        form.defaults(setFormDefaults());
        form.resetAndClearErrors();
    };

    const emit = defineEmits<{
        (e: 'user-updated', user: User): void
        (e: 'user-created', user: User): void
    }>();

    const handleSubmit = () => {
        const method = isEditing.value ? 'put' : 'post';
        const url = isEditing.value ? '/users/' + form.id : '/users';
        isSubmitting.value = true;
        axios[method](url, form.data())
        .then(response => {
            if (isEditing.value) {
                emit('user-updated', response.data);
            } else {
                emit('user-created', response.data);
            }
            closeSheet();
        })
        .catch(error => {
            form.errors = error.response.data.errors;
        }).finally(() => {
            isSubmitting.value = false;
        });
    };

    defineExpose({
        openSheet,
        closeSheet,
    });

    
</script>

<template>
    <Sheet 
        :open="open"
        @update:open="closeSheet"
    >
        <SheetContent 
            :side="appLocale === 'ar' ? 'left' : 'right'"
        >
            <SheetHeader>
                <SheetTitle>
                    {{ isEditing ? $t('Edit User') : $t('Add User') }}
                </SheetTitle>
                <SheetDescription>
                    {{ isEditing ? $t('Edit the details to update the user.') : $t('Fill in the details to add a new user.') }}
                </SheetDescription>
            </SheetHeader>
            <form @submit.prevent="handleSubmit">
                <div class="grid flex-1 auto-rows-min gap-6 px-4">
                    <div class="grid gap-3">
                        <Label for="form-name_en">{{ $t('Name') }}</Label>
                        <Input 
                            :aria-invalid="form.errors?.name?.[0] ? true : false" 
                            id="form-name_en" 
                            :placeholder="$t('Name')" 
                            v-model="form.name" 
                            :default-value="form.name"
                        />
                        <InputError :message="form.errors?.name?.[0]" />
                    </div>
                    <div class="grid gap-3">
                        <Label for="form-email">{{ $t('Email') }}</Label>
                        <Input 
                            :aria-invalid="form.errors?.email?.[0] ? true : false" 
                            id="form-email" 
                            type="email" 
                            :placeholder="$t('Email')" 
                            v-model="form.email" 
                            :default-value="form.email"
                        />
                        <InputError :message="form.errors?.email?.[0]" />
                    </div>

                    <div class="flex items-center space-x-2">
                        <Switch 
                            id="form-is_active" 
                            v-model="form.is_active" 
                            :default-value="form.is_active"
                        />
                        <Label for="form-is_active">{{ $t('Is Active') }}</Label>
                    </div>
                </div>
                <SheetFooter>
                    <Button 
                        :disabled="isSubmitting || !form.isDirty" 
                        type="submit"
                        :default-value="isEditing ? $t('Update') : $t('Add')"
                    >
                    {{ isEditing ? $t('Update') : $t('Add') }}
                    <Spinner v-if="isSubmitting" />
                    </Button>
                    <SheetClose as-child>
                        <Button variant="outline">{{ $t('Close') }}</Button>
                    </SheetClose>
                </SheetFooter>
            </form>
        </SheetContent>
    </Sheet>
</template>
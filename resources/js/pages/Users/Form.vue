<script setup lang="ts">
    import InputError from '@/components/InputError.vue';
    import { Spinner } from '@/components/ui/spinner';
    import { Button } from '@/components/ui/button';
    import { useCrud } from '@/composables/useCrud';
    import { Switch } from '@/components/ui/switch';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useForm } from '@inertiajs/vue3';
    import { User } from '@/types/models';
    import { watch, inject } from 'vue';
    import {
        Sheet,
        SheetClose,
        SheetContent,
        SheetDescription,
        SheetFooter,
        SheetHeader,
        SheetTitle,
    } from '@/components/ui/sheet';

    const appLocale = localStorage.getItem('locale') || 'en';
    const {formSheetIsOpen, closeSheet, selectedRecord, submit, isSubmitting, errors} = inject('sharedCrud') as ReturnType<typeof useCrud<User>>;
    const form = useForm<User>({
        id: 0,
        name: '',
        email: '',
        is_active: true,
    });
    const setFormDefaults = (user?: User | null) => {
        return {
            id: user?.id ?? 0,
            name: user?.name ?? '',
            email: user?.email ?? '',
            is_active: user?.is_active ?? true,
        }
    };

    watch(formSheetIsOpen, () => {
        form.defaults(setFormDefaults(selectedRecord.value));
        form.resetAndClearErrors();
    });
    
</script>

<template>
    <Sheet 
        :open="formSheetIsOpen"
        @update:open="closeSheet()"
    >
        <SheetContent 
            :side="appLocale === 'ar' ? 'left' : 'right'"
        >
            <SheetHeader>
                <SheetTitle>
                    {{ selectedRecord ? $t('Edit User') : $t('Add User') }}
                </SheetTitle>
                <SheetDescription>
                    {{ selectedRecord ? $t('Edit the details to update the user.') : $t('Fill in the details to add a new user.') }}
                </SheetDescription>
            </SheetHeader>
            <form @submit.prevent="submit('/users', form.data())">
                <div class="grid flex-1 auto-rows-min gap-6 px-4">
                    <div class="grid gap-3">
                        <Label for="form-name_en">{{ $t('Name') }}</Label>
                        <Input 
                            :aria-invalid="errors?.name?.[0] ? true : false" 
                            id="form-name_en" 
                            :placeholder="$t('Name')" 
                            v-model="form.name" 
                            :default-value="form.name"
                        />
                        <InputError :message="errors?.name?.[0]" />
                    </div>
                    <div class="grid gap-3">
                        <Label for="form-email">{{ $t('Email') }}</Label>
                        <Input 
                            :aria-invalid="errors?.email?.[0] ? true : false" 
                            id="form-email" 
                            type="email" 
                            :placeholder="$t('Email')" 
                            v-model="form.email" 
                            :default-value="form.email"
                        />
                        <InputError :message="errors?.email?.[0]" />
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
                        :default-value="selectedRecord ? $t('Update') : $t('Add')"
                    >
                    {{ selectedRecord ? $t('Update') : $t('Add') }}
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
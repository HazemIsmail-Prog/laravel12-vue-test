import axios from 'axios';
import { ref } from 'vue';

export function useCrud<T>() {
    const data = ref<T[]>([]);
    const total = ref(0);
    const isFetching = ref(false);
    const nextPageUrl = ref<string | null>(null);
    const currentPage = ref(1);
    const formSheetIsOpen = ref(false);
    const selectedRecord = ref<T | null>(null);
    const isSubmitting = ref(false);
    const errors = ref<any>({});

    const fetch = (url: string, params: object = {}) => {
        isFetching.value = true;
        axios.get(url, { params })
            .then(response => {
                data.value = response.data.data;
                total.value = response.data.total;
                nextPageUrl.value = response.data.next_page_url;
                currentPage.value = response.data.current_page;
            })
            .catch(error => {
                throw error;
            })
            .finally(() => {
                isFetching.value = false;
            });
    };

    const loadMore = (params: object = {}) => {

        if (!nextPageUrl.value) return;
        axios.get(nextPageUrl.value, params)
            .then(response => {
                const newRecords = response.data.data.filter((record: unknown) => {
                    return !data.value.some(r => (r as { id: number }).id === (record as { id: number }).id);
                });
                data.value.push(...newRecords);
            nextPageUrl.value = response.data.next_page_url;
        });
    };

    const openSheet = (record: T | null) => {
        errors.value = {};
        selectedRecord.value = record;
        formSheetIsOpen.value = true;
    };

    const closeSheet = () => {
        errors.value = {};
        selectedRecord.value = null;
        formSheetIsOpen.value = false;
    };

    const submit = (url: string, payload: any) => {
        const method = selectedRecord.value ? 'put' : 'post';
        const urlString = selectedRecord.value ? `${url}/${selectedRecord.value.id}` : url;
        isSubmitting.value = true;
        axios[method](urlString, payload)
        .then(response => {
            if (selectedRecord.value) {
                data.value = data.value.map((item) => {
                    if ((item as { id: number }).id === selectedRecord.value.id) {
                        return response.data;
                    }
                    return item;
                });
            } else {
                data.value.unshift(response.data);
                total.value += 1;
            }
            closeSheet();
        })
        .catch(error => {
            errors.value = error.response.data.errors;
        })
        .finally(() => {
            isSubmitting.value = false;
        });
    };

    const destroy = async (url: string, id: number | string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        axios.delete(`${url}/${id}`)
            .then(response => {
                data.value = data.value.filter((item: unknown) => (item as { id: number }).id !== id) as T[];
                total.value -= 1;
                return response.data;
            })
            .catch(error => {
                throw error;
            });
    };


    return {
        fetch,
        loadMore,
        submit,
        destroy,
        openSheet,
        closeSheet,
        data,
        total,
        isFetching,
        nextPageUrl,
        currentPage,
        formSheetIsOpen,
        isSubmitting,
        errors,
        selectedRecord,
    };
}
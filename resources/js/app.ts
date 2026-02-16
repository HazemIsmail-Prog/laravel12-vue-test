import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import '../css/app.css';
import { initializeTheme } from './composables/useAppearance';
import { createI18n } from 'vue-i18n'
import en from '../../lang/en.json';
import ar from '../../lang/ar.json';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const appLocale = import.meta.env.VITE_APP_LOCALE || 'en';


const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('locale') ?? appLocale,
    fallbackLocale: 'en',
    messages: {
        en: en,
        ar: ar,
    }
})

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob<DefineComponent>('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(i18n)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on page load...
initializeTheme();

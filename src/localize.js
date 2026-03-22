const languages = {
    en: {
        card: {
            name: 'SugarTV Card',
            description:
                'Displays CGM glucose data with trend, delta, and color-coded zones. Works with Dexcom, Nightscout, LibreView, LibreLink, and Carelink.',
        },
        editor: {
            glucose_value: 'Glucose sensor',
            glucose_trend: 'Trend sensor (auto-detected)',
            show_prediction: 'Glucose forecast',
            color_thresholds: 'Color-coded glucose zones',
            urgent_low: 'Urgent low',
            low: 'Low',
            high: 'High',
            urgent_high: 'Urgent high',
            thresholds_title: 'Glucose thresholds (mg/dL or mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Expected to rise over {0} {1} in 15 minutes',
            rise_in: 'Expected to rise {0} {1} in 15 minutes',
            fall_over: 'Expected to fall over {0} {1} in 15 minutes',
            fall_in: 'Expected to fall {0} {1} in 15 minutes',
        },
        common: {
            not_available: 'N/A',
            default_time: '00:00',
        },
    },
    ru: {
        card: {
            name: 'Карточка SugarTV',
            description:
                'Отображает данные глюкозы с трендом, дельтой и цветовыми зонами. Поддерживает Dexcom, Nightscout, LibreView, LibreLink и Carelink.',
        },
        editor: {
            glucose_value: 'Сенсор глюкозы',
            glucose_trend: 'Сенсор тренда (определяется автоматически)',
            show_prediction: 'Прогноз глюкозы',
            color_thresholds: 'Цветовые зоны глюкозы',
            urgent_low: 'Критически низкий',
            low: 'Низкий',
            high: 'Высокий',
            urgent_high: 'Критически высокий',
            thresholds_title: 'Пороги глюкозы (мг/дл или ммоль/л)',
        },
        units: {
            mgdl: 'мг/дл',
            mmoll: 'ммоль/л',
        },
        predictions: {
            rise_over:
                'Ожидается подъем более чем на {0} {1} в течение 15 минут',
            rise_in: 'Ожидается подъем на {0} {1} в течение 15 минут',
            fall_over:
                'Ожидается падение более чем на {0} {1} в течение 15 минут',
            fall_in: 'Ожидается падение на {0} {1} в течение 15 минут',
        },
        common: {
            not_available: 'Н/Д',
            default_time: '00:00',
        },
    },
};

export function getLocalizer(config, hass) {
    const lang = (config && config.locale) || (hass && hass.language) || 'en';
    const lang_code = lang.split('-')[0];

    return function (string, ...args) {
        let translated;
        try {
            translated = string
                .split('.')
                .reduce((o, i) => o[i], languages[lang_code]);
        } catch (e) {
            // do nothing
        }

        if (!translated) {
            try {
                translated = string
                    .split('.')
                    .reduce((o, i) => o[i], languages.en);
            } catch (e) {
                // do nothing
            }
        }

        if (translated && args.length > 0) {
            args.forEach((arg, index) => {
                translated = translated.replace(`{${index}}`, arg);
            });
        }

        return translated || string;
    };
}

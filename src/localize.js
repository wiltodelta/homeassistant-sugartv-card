const languages = {
    en: {
        card: {
            name: 'SugarTV Card',
            description:
                'A custom lovelace card for Home Assistant that provides a better way to display Dexcom data.',
        },
        editor: {
            glucose_value: 'Glucose value entity (required)',
            glucose_trend: 'Glucose trend entity (required)',
            show_prediction: 'Show prediction',
            unit_override: 'Unit override',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
            auto: 'Auto (from sensor)',
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
                'Карточка для Home Assistant, которая предоставляет лучший способ отображения данных Dexcom.',
        },
        editor: {
            glucose_value: 'Значение глюкозы (обязательно)',
            glucose_trend: 'Тренд глюкозы (обязательно)',
            show_prediction: 'Показывать прогноз?',
            unit_override: 'Переопределение единиц',
        },
        units: {
            mgdl: 'мг/дл',
            mmoll: 'ммоль/л',
            auto: 'Авто (с датчика)',
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

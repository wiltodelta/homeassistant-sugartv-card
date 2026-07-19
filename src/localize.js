export const languages = {
    en: {
        card: {
            name: 'SugarTV Card',
            description:
                'Displays CGM glucose data with trend, delta, and color-coded zones. Works with Dexcom, Nightscout, LibreView, LibreLink, and Carelink.',
        },
        editor: {
            glucose_value: 'Glucose sensor',
            glucose_trend: 'Trend sensor (auto-detected)',
            timestamp_attribute: 'Reading time attribute (optional)',
            show_prediction: 'Glucose forecast',
            relative_time: 'Show reading age instead of the clock',
            dim_by_age: 'Start fading before the reading is stale',
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
            name: 'SugarTV Card',
            description:
                'Отображает данные глюкозы с трендом, дельтой и цветовыми зонами. Поддерживает Dexcom, Nightscout, LibreView, LibreLink и Carelink.',
        },
        editor: {
            glucose_value: 'Сенсор глюкозы',
            glucose_trend: 'Сенсор тренда (определяется автоматически)',
            timestamp_attribute: 'Атрибут времени измерения (необязательно)',
            show_prediction: 'Прогноз глюкозы',
            relative_time: 'Показывать давность измерения вместо времени',
            dim_by_age: 'Начинать приглушение до устаревания',
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
    de: {
        card: {
            name: 'SugarTV Card',
            description:
                'Zeigt CGM-Glukosedaten mit Trend, Delta und Farbzonen. Funktioniert mit Dexcom, Nightscout, LibreView, LibreLink und Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Trendsensor (automatisch erkannt)',
            timestamp_attribute: 'Attribut der Messzeit (optional)',
            show_prediction: 'Glukoseprognose',
            relative_time: 'Alter der Messung statt der Uhrzeit',
            dim_by_age: 'Schon vor dem Veralten abblenden',
            color_thresholds: 'Farbige Glukosezonen',
            urgent_low: 'Kritisch niedrig',
            low: 'Niedrig',
            high: 'Hoch',
            urgent_high: 'Kritisch hoch',
            thresholds_title: 'Glukosegrenzwerte (mg/dL oder mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over:
                'Voraussichtlicher Anstieg um mehr als {0} {1} in 15 Minuten',
            rise_in: 'Voraussichtlicher Anstieg um {0} {1} in 15 Minuten',
            fall_over:
                'Voraussichtlicher Abfall um mehr als {0} {1} in 15 Minuten',
            fall_in: 'Voraussichtlicher Abfall um {0} {1} in 15 Minuten',
        },
        common: {
            not_available: 'K/A',
            default_time: '00:00',
        },
    },
    fr: {
        card: {
            name: 'SugarTV Card',
            description:
                'Affiche les données de glycémie en continu avec tendance, delta et zones colorées. Compatible Dexcom, Nightscout, LibreView, LibreLink et Carelink.',
        },
        editor: {
            glucose_value: 'Capteur de glycémie',
            glucose_trend: 'Capteur de tendance (détecté automatiquement)',
            timestamp_attribute: 'Attribut de l’heure de mesure (facultatif)',
            show_prediction: 'Prévision de glycémie',
            relative_time: 'Afficher l’ancienneté plutôt que l’heure',
            dim_by_age: 'Estomper avant que la mesure soit périmée',
            color_thresholds: 'Zones de glycémie colorées',
            urgent_low: 'Très bas',
            low: 'Bas',
            high: 'Haut',
            urgent_high: 'Très haut',
            thresholds_title: 'Seuils de glycémie (mg/dL ou mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Hausse attendue de plus de {0} {1} en 15 minutes',
            rise_in: 'Hausse attendue de {0} {1} en 15 minutes',
            fall_over: 'Baisse attendue de plus de {0} {1} en 15 minutes',
            fall_in: 'Baisse attendue de {0} {1} en 15 minutes',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    es: {
        card: {
            name: 'SugarTV Card',
            description:
                'Muestra datos de glucosa MCG con tendencia, delta y zonas de color. Compatible con Dexcom, Nightscout, LibreView, LibreLink y Carelink.',
        },
        editor: {
            glucose_value: 'Sensor de glucosa',
            glucose_trend: 'Sensor de tendencia (detección automática)',
            timestamp_attribute: 'Atributo de la hora de medición (opcional)',
            show_prediction: 'Previsión de glucosa',
            relative_time: 'Mostrar la antigüedad en lugar de la hora',
            dim_by_age: 'Atenuar antes de que la medición caduque',
            color_thresholds: 'Zonas de glucosa por color',
            urgent_low: 'Muy bajo',
            low: 'Bajo',
            high: 'Alto',
            urgent_high: 'Muy alto',
            thresholds_title: 'Umbrales de glucosa (mg/dL o mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Se espera una subida de más de {0} {1} en 15 minutos',
            rise_in: 'Se espera una subida de {0} {1} en 15 minutos',
            fall_over: 'Se espera una bajada de más de {0} {1} en 15 minutos',
            fall_in: 'Se espera una bajada de {0} {1} en 15 minutos',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    it: {
        card: {
            name: 'SugarTV Card',
            description:
                'Mostra i dati glicemici CGM con tendenza, delta e zone colorate. Compatibile con Dexcom, Nightscout, LibreView, LibreLink e Carelink.',
        },
        editor: {
            glucose_value: 'Sensore glicemia',
            glucose_trend: 'Sensore tendenza (rilevato automaticamente)',
            timestamp_attribute: 'Attributo ora di misurazione (facoltativo)',
            show_prediction: 'Previsione glicemia',
            relative_time: 'Mostra da quanto tempo invece dell’ora',
            dim_by_age: 'Attenuare prima che la misurazione scada',
            color_thresholds: 'Zone glicemiche colorate',
            urgent_low: 'Molto basso',
            low: 'Basso',
            high: 'Alto',
            urgent_high: 'Molto alto',
            thresholds_title: 'Soglie glicemiche (mg/dL o mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Previsto un aumento di oltre {0} {1} in 15 minuti',
            rise_in: 'Previsto un aumento di {0} {1} in 15 minuti',
            fall_over: 'Prevista una diminuzione di oltre {0} {1} in 15 minuti',
            fall_in: 'Prevista una diminuzione di {0} {1} in 15 minuti',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    nl: {
        card: {
            name: 'SugarTV Card',
            description:
                'Toont CGM-glucosegegevens met trend, delta en kleurzones. Werkt met Dexcom, Nightscout, LibreView, LibreLink en Carelink.',
        },
        editor: {
            glucose_value: 'Glucosesensor',
            glucose_trend: 'Trendsensor (automatisch gedetecteerd)',
            timestamp_attribute: 'Attribuut met meettijd (optioneel)',
            show_prediction: 'Glucoseverwachting',
            relative_time: 'Toon hoe oud de meting is in plaats van de klok',
            dim_by_age: 'Dimmen voordat de meting verouderd is',
            color_thresholds: 'Gekleurde glucosezones',
            urgent_low: 'Zeer laag',
            low: 'Laag',
            high: 'Hoog',
            urgent_high: 'Zeer hoog',
            thresholds_title: 'Glucosedrempels (mg/dL of mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Verwachte stijging van meer dan {0} {1} in 15 minuten',
            rise_in: 'Verwachte stijging van {0} {1} in 15 minuten',
            fall_over: 'Verwachte daling van meer dan {0} {1} in 15 minuten',
            fall_in: 'Verwachte daling van {0} {1} in 15 minuten',
        },
        common: {
            not_available: 'N.v.t.',
            default_time: '00:00',
        },
    },
    pl: {
        card: {
            name: 'SugarTV Card',
            description:
                'Wyświetla dane glikemii CGM z trendem, deltą i strefami kolorów. Działa z Dexcom, Nightscout, LibreView, LibreLink i Carelink.',
        },
        editor: {
            glucose_value: 'Czujnik glikemii',
            glucose_trend: 'Czujnik trendu (wykrywany automatycznie)',
            timestamp_attribute: 'Atrybut czasu pomiaru (opcjonalnie)',
            show_prediction: 'Prognoza glikemii',
            relative_time: 'Pokazuj wiek odczytu zamiast godziny',
            dim_by_age: 'Przygaszaj, zanim pomiar się zestarzeje',
            color_thresholds: 'Kolorowe strefy glikemii',
            urgent_low: 'Bardzo niski',
            low: 'Niski',
            high: 'Wysoki',
            urgent_high: 'Bardzo wysoki',
            thresholds_title: 'Progi glikemii (mg/dL lub mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Oczekiwany wzrost o ponad {0} {1} w ciągu 15 minut',
            rise_in: 'Oczekiwany wzrost o {0} {1} w ciągu 15 minut',
            fall_over: 'Oczekiwany spadek o ponad {0} {1} w ciągu 15 minut',
            fall_in: 'Oczekiwany spadek o {0} {1} w ciągu 15 minut',
        },
        common: {
            not_available: 'Brak',
            default_time: '00:00',
        },
    },
    uk: {
        card: {
            name: 'SugarTV Card',
            description:
                'Показує дані глюкози CGM із трендом, дельтою та кольоровими зонами. Працює з Dexcom, Nightscout, LibreView, LibreLink і Carelink.',
        },
        editor: {
            glucose_value: 'Сенсор глюкози',
            glucose_trend: 'Сенсор тренду (визначається автоматично)',
            timestamp_attribute: 'Атрибут часу вимірювання (необов’язково)',
            show_prediction: 'Прогноз глюкози',
            relative_time: 'Показувати давність вимірювання замість часу',
            dim_by_age: 'Починати приглушення до застарівання',
            color_thresholds: 'Кольорові зони глюкози',
            urgent_low: 'Критично низький',
            low: 'Низький',
            high: 'Високий',
            urgent_high: 'Критично високий',
            thresholds_title: 'Пороги глюкози (мг/дл або ммоль/л)',
        },
        units: {
            mgdl: 'мг/дл',
            mmoll: 'ммоль/л',
        },
        predictions: {
            rise_over: 'Очікується зростання більш ніж на {0} {1} за 15 хвилин',
            rise_in: 'Очікується зростання на {0} {1} за 15 хвилин',
            fall_over: 'Очікується падіння більш ніж на {0} {1} за 15 хвилин',
            fall_in: 'Очікується падіння на {0} {1} за 15 хвилин',
        },
        common: {
            not_available: 'Н/Д',
            default_time: '00:00',
        },
    },
    pt: {
        card: {
            name: 'SugarTV Card',
            description:
                'Mostra dados de glicose CGM com tendência, delta e zonas coloridas. Funciona com Dexcom, Nightscout, LibreView, LibreLink e Carelink.',
        },
        editor: {
            glucose_value: 'Sensor de glicose',
            glucose_trend: 'Sensor de tendência (detetado automaticamente)',
            timestamp_attribute: 'Atributo da hora de medição (opcional)',
            show_prediction: 'Previsão de glicose',
            relative_time: 'Mostrar há quanto tempo em vez da hora',
            dim_by_age: 'Atenuar antes de a medição ficar desatualizada',
            color_thresholds: 'Zonas de glicose coloridas',
            urgent_low: 'Muito baixo',
            low: 'Baixo',
            high: 'Alto',
            urgent_high: 'Muito alto',
            thresholds_title: 'Limites de glicose (mg/dL ou mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Previsto um aumento de mais de {0} {1} em 15 minutos',
            rise_in: 'Previsto um aumento de {0} {1} em 15 minutos',
            fall_over: 'Prevista uma descida de mais de {0} {1} em 15 minutos',
            fall_in: 'Prevista uma descida de {0} {1} em 15 minutos',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    sv: {
        card: {
            name: 'SugarTV Card',
            description:
                'Visar CGM-glukosdata med trend, delta och färgzoner. Fungerar med Dexcom, Nightscout, LibreView, LibreLink och Carelink.',
        },
        editor: {
            glucose_value: 'Glukossensor',
            glucose_trend: 'Trendsensor (identifieras automatiskt)',
            timestamp_attribute: 'Attribut för mättid (valfritt)',
            show_prediction: 'Glukosprognos',
            relative_time: 'Visa mätningens ålder i stället för klockan',
            dim_by_age: 'Tona ned innan mätningen blir inaktuell',
            color_thresholds: 'Färgade glukoszoner',
            urgent_low: 'Mycket lågt',
            low: 'Lågt',
            high: 'Högt',
            urgent_high: 'Mycket högt',
            thresholds_title: 'Glukosgränser (mg/dL eller mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Förväntad ökning med mer än {0} {1} på 15 minuter',
            rise_in: 'Förväntad ökning med {0} {1} på 15 minuter',
            fall_over: 'Förväntad minskning med mer än {0} {1} på 15 minuter',
            fall_in: 'Förväntad minskning med {0} {1} på 15 minuter',
        },
        common: {
            not_available: 'Ej tillg.',
            default_time: '00:00',
        },
    },
    cs: {
        card: {
            name: 'SugarTV Card',
            description:
                'Zobrazuje data glykemie CGM s trendem, deltou a barevnými zónami. Funguje s Dexcom, Nightscout, LibreView, LibreLink a Carelink.',
        },
        editor: {
            glucose_value: 'Senzor glykemie',
            glucose_trend: 'Senzor trendu (detekován automaticky)',
            timestamp_attribute: 'Atribut času měření (volitelné)',
            show_prediction: 'Předpověď glykemie',
            relative_time: 'Zobrazit stáří měření místo času',
            dim_by_age: 'Ztlumit dříve, než měření zestárne',
            color_thresholds: 'Barevné zóny glykemie',
            urgent_low: 'Kriticky nízká',
            low: 'Nízká',
            high: 'Vysoká',
            urgent_high: 'Kriticky vysoká',
            thresholds_title: 'Prahy glykemie (mg/dL nebo mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Očekává se vzestup o více než {0} {1} za 15 minut',
            rise_in: 'Očekává se vzestup o {0} {1} za 15 minut',
            fall_over: 'Očekává se pokles o více než {0} {1} za 15 minut',
            fall_in: 'Očekává se pokles o {0} {1} za 15 minut',
        },
        common: {
            not_available: 'N/A',
            default_time: '00:00',
        },
    },
    af: {
        card: {
            name: 'SugarTV Card',
            description:
                'Vertoon CGM-glukosedata met tendens, verandering en kleursones. Werk met Dexcom, Nightscout, LibreView, LibreLink en Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Tendenssensor (outomaties bespeur)',
            timestamp_attribute: 'Attribuut vir metingstyd (opsioneel)',
            show_prediction: 'Glukosevoorspelling',
            relative_time: 'Wys ouderdom van meting in plaas van die klok',
            dim_by_age: 'Verdof voor die lesing verouderd is',
            color_thresholds: 'Gekleurde glukosesones',
            urgent_low: 'Krities laag',
            low: 'Laag',
            high: 'Hoog',
            urgent_high: 'Krities hoog',
            thresholds_title: 'Glukosedrempels (mg/dL of mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Verwagte styging van meer as {0} {1} in 15 minute',
            rise_in: 'Verwagte styging van {0} {1} in 15 minute',
            fall_over: 'Verwagte daling van meer as {0} {1} in 15 minute',
            fall_in: 'Verwagte daling van {0} {1} in 15 minute',
        },
        common: {
            not_available: 'N.v.t.',
            default_time: '00:00',
        },
    },
    ar: {
        card: {
            name: 'SugarTV Card',
            description:
                'يعرض بيانات الجلوكوز من الجهاز المستمر مع الاتجاه والتغير والمناطق الملونة. يعمل مع Dexcom وNightscout وLibreView وLibreLink وCarelink.',
        },
        editor: {
            glucose_value: 'مستشعر الجلوكوز',
            glucose_trend: 'مستشعر الاتجاه (يُكتشف تلقائيًا)',
            timestamp_attribute: 'خاصية وقت القياس (اختياري)',
            show_prediction: 'توقع الجلوكوز',
            relative_time: 'عرض عمر القياس بدلاً من الساعة',
            dim_by_age: 'ابدأ التعتيم قبل أن تصبح القراءة قديمة',
            color_thresholds: 'مناطق الجلوكوز الملونة',
            urgent_low: 'منخفض حرج',
            low: 'منخفض',
            high: 'مرتفع',
            urgent_high: 'مرتفع حرج',
            thresholds_title: 'حدود الجلوكوز (mg/dL أو mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'يُتوقع ارتفاع بأكثر من {0} {1} خلال 15 دقيقة',
            rise_in: 'يُتوقع ارتفاع بمقدار {0} {1} خلال 15 دقيقة',
            fall_over: 'يُتوقع انخفاض بأكثر من {0} {1} خلال 15 دقيقة',
            fall_in: 'يُتوقع انخفاض بمقدار {0} {1} خلال 15 دقيقة',
        },
        common: {
            not_available: 'غير متاح',
            default_time: '00:00',
        },
    },
    bg: {
        card: {
            name: 'SugarTV Card',
            description:
                'Показва данни за глюкоза от CGM с тенденция, промяна и цветни зони. Работи с Dexcom, Nightscout, LibreView, LibreLink и Carelink.',
        },
        editor: {
            glucose_value: 'Сензор за глюкоза',
            glucose_trend: 'Сензор за тенденция (открива се автоматично)',
            timestamp_attribute:
                'Атрибут за време на измерване (незадължително)',
            show_prediction: 'Прогноза за глюкоза',
            relative_time: 'Показване на възрастта вместо часа',
            dim_by_age: 'Затъмняване, преди измерването да остарее',
            color_thresholds: 'Цветни зони на глюкоза',
            urgent_low: 'Критично ниска',
            low: 'Ниска',
            high: 'Висока',
            urgent_high: 'Критично висока',
            thresholds_title: 'Прагове на глюкоза (mg/dL или mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Очаква се покачване с повече от {0} {1} за 15 минути',
            rise_in: 'Очаква се покачване с {0} {1} за 15 минути',
            fall_over: 'Очаква се спадане с повече от {0} {1} за 15 минути',
            fall_in: 'Очаква се спадане с {0} {1} за 15 минути',
        },
        common: {
            not_available: 'Н/Д',
            default_time: '00:00',
        },
    },
    bn: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM গ্লুকোজ ডেটা প্রবণতা, পরিবর্তন এবং রঙিন অঞ্চলসহ দেখায়। Dexcom, Nightscout, LibreView, LibreLink এবং Carelink-এর সাথে কাজ করে।',
        },
        editor: {
            glucose_value: 'গ্লুকোজ সেন্সর',
            glucose_trend: 'প্রবণতা সেন্সর (স্বয়ংক্রিয়ভাবে শনাক্ত)',
            timestamp_attribute: 'পরিমাপের সময়ের অ্যাট্রিবিউট (ঐচ্ছিক)',
            show_prediction: 'গ্লুকোজ পূর্বাভাস',
            relative_time: 'ঘড়ির বদলে পরিমাপের বয়স দেখান',
            dim_by_age: 'পরিমাপ পুরোনো হওয়ার আগেই ম্লান করা শুরু করুন',
            color_thresholds: 'রঙিন গ্লুকোজ অঞ্চল',
            urgent_low: 'অত্যন্ত কম',
            low: 'কম',
            high: 'উচ্চ',
            urgent_high: 'অত্যন্ত উচ্চ',
            thresholds_title: 'গ্লুকোজ সীমা (mg/dL বা mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '১৫ মিনিটে {0} {1}-এর বেশি বৃদ্ধি প্রত্যাশিত',
            rise_in: '১৫ মিনিটে {0} {1} বৃদ্ধি প্রত্যাশিত',
            fall_over: '১৫ মিনিটে {0} {1}-এর বেশি হ্রাস প্রত্যাশিত',
            fall_in: '১৫ মিনিটে {0} {1} হ্রাস প্রত্যাশিত',
        },
        common: {
            not_available: 'নেই',
            default_time: '00:00',
        },
    },
    bs: {
        card: {
            name: 'SugarTV Card',
            description:
                'Prikazuje podatke o glukozi CGM s trendom, promjenom i zonama u boji. Radi s Dexcom, Nightscout, LibreView, LibreLink i Carelink.',
        },
        editor: {
            glucose_value: 'Senzor glukoze',
            glucose_trend: 'Senzor trenda (automatski otkriven)',
            timestamp_attribute: 'Atribut vremena mjerenja (opcionalno)',
            show_prediction: 'Prognoza glukoze',
            relative_time: 'Prikaži starost mjerenja umjesto sata',
            dim_by_age: 'Prigušiti prije nego mjerenje zastari',
            color_thresholds: 'Obojene zone glukoze',
            urgent_low: 'Kritično nisko',
            low: 'Nisko',
            high: 'Visoko',
            urgent_high: 'Kritično visoko',
            thresholds_title: 'Pragovi glukoze (mg/dL ili mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Očekuje se porast veći od {0} {1} za 15 minuta',
            rise_in: 'Očekuje se porast od {0} {1} za 15 minuta',
            fall_over: 'Očekuje se pad veći od {0} {1} za 15 minuta',
            fall_in: 'Očekuje se pad od {0} {1} za 15 minuta',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    ca: {
        card: {
            name: 'SugarTV Card',
            description:
                'Mostra dades de glucosa CGM amb tendència, delta i zones de color. Funciona amb Dexcom, Nightscout, LibreView, LibreLink i Carelink.',
        },
        editor: {
            glucose_value: 'Sensor de glucosa',
            glucose_trend: 'Sensor de tendència (detectat automàticament)',
            timestamp_attribute: 'Atribut de l’hora de mesura (opcional)',
            show_prediction: 'Previsió de glucosa',
            relative_time: 'Mostra l’antiguitat en lloc de l’hora',
            dim_by_age: 'Atenuar abans que la mesura caduqui',
            color_thresholds: 'Zones de glucosa per color',
            urgent_low: 'Molt baixa',
            low: 'Baixa',
            high: 'Alta',
            urgent_high: 'Molt alta',
            thresholds_title: 'Llindars de glucosa (mg/dL o mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'S’espera una pujada de més de {0} {1} en 15 minuts',
            rise_in: 'S’espera una pujada de {0} {1} en 15 minuts',
            fall_over: 'S’espera una baixada de més de {0} {1} en 15 minuts',
            fall_in: 'S’espera una baixada de {0} {1} en 15 minuts',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    cy: {
        card: {
            name: 'SugarTV Card',
            description:
                'Yn dangos data glwcos CGM gyda thuedd, newid a pharthau lliw. Yn gweithio gyda Dexcom, Nightscout, LibreView, LibreLink a Carelink.',
        },
        editor: {
            glucose_value: 'Synhwyrydd glwcos',
            glucose_trend: 'Synhwyrydd tuedd (canfyddir yn awtomatig)',
            timestamp_attribute: 'Priodoledd amser y mesuriad (dewisol)',
            show_prediction: 'Rhagolwg glwcos',
            relative_time: "Dangos oedran y mesuriad yn lle'r cloc",
            dim_by_age: "Dechrau pylu cyn i'r darlleniad heneiddio",
            color_thresholds: 'Parthau glwcos lliw',
            urgent_low: 'Isel iawn',
            low: 'Isel',
            high: 'Uchel',
            urgent_high: 'Uchel iawn',
            thresholds_title: 'Trothwyon glwcos (mg/dL neu mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Disgwylir codiad o fwy na {0} {1} mewn 15 munud',
            rise_in: 'Disgwylir codiad o {0} {1} mewn 15 munud',
            fall_over: 'Disgwylir gostyngiad o fwy na {0} {1} mewn 15 munud',
            fall_in: 'Disgwylir gostyngiad o {0} {1} mewn 15 munud',
        },
        common: {
            not_available: 'Dim',
            default_time: '00:00',
        },
    },
    da: {
        card: {
            name: 'SugarTV Card',
            description:
                'Viser CGM-glukosedata med tendens, delta og farvezoner. Fungerer med Dexcom, Nightscout, LibreView, LibreLink og Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Tendenssensor (registreres automatisk)',
            timestamp_attribute: 'Attribut for måletidspunkt (valgfrit)',
            show_prediction: 'Glukoseprognose',
            relative_time: 'Vis målingens alder i stedet for klokkeslæt',
            dim_by_age: 'Dæmp, før målingen bliver forældet',
            color_thresholds: 'Farvede glukosezoner',
            urgent_low: 'Kritisk lav',
            low: 'Lav',
            high: 'Høj',
            urgent_high: 'Kritisk høj',
            thresholds_title: 'Glukosegrænser (mg/dL eller mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Forventet stigning på mere end {0} {1} på 15 minutter',
            rise_in: 'Forventet stigning på {0} {1} på 15 minutter',
            fall_over: 'Forventet fald på mere end {0} {1} på 15 minutter',
            fall_in: 'Forventet fald på {0} {1} på 15 minutter',
        },
        common: {
            not_available: 'Ikke tilgæng.',
            default_time: '00:00',
        },
    },
    el: {
        card: {
            name: 'SugarTV Card',
            description:
                'Εμφανίζει δεδομένα γλυκόζης CGM με τάση, μεταβολή και έγχρωμες ζώνες. Λειτουργεί με Dexcom, Nightscout, LibreView, LibreLink και Carelink.',
        },
        editor: {
            glucose_value: 'Αισθητήρας γλυκόζης',
            glucose_trend: 'Αισθητήρας τάσης (αυτόματος εντοπισμός)',
            timestamp_attribute: 'Ιδιότητα ώρας μέτρησης (προαιρετικό)',
            show_prediction: 'Πρόβλεψη γλυκόζης',
            relative_time: 'Εμφάνιση ηλικίας μέτρησης αντί για ώρα',
            dim_by_age: 'Εξασθένιση πριν η μέτρηση παλιώσει',
            color_thresholds: 'Έγχρωμες ζώνες γλυκόζης',
            urgent_low: 'Κρίσιμα χαμηλή',
            low: 'Χαμηλή',
            high: 'Υψηλή',
            urgent_high: 'Κρίσιμα υψηλή',
            thresholds_title: 'Όρια γλυκόζης (mg/dL ή mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Αναμένεται άνοδος πάνω από {0} {1} σε 15 λεπτά',
            rise_in: 'Αναμένεται άνοδος κατά {0} {1} σε 15 λεπτά',
            fall_over: 'Αναμένεται πτώση πάνω από {0} {1} σε 15 λεπτά',
            fall_in: 'Αναμένεται πτώση κατά {0} {1} σε 15 λεπτά',
        },
        common: {
            not_available: 'Μ/Δ',
            default_time: '00:00',
        },
    },
    'en-GB': {
        card: {
            name: 'SugarTV Card',
            description:
                'Displays CGM glucose data with trend, delta, and colour-coded zones. Works with Dexcom, Nightscout, LibreView, LibreLink, and Carelink.',
        },
        editor: {
            glucose_value: 'Glucose sensor',
            glucose_trend: 'Trend sensor (auto-detected)',
            timestamp_attribute: 'Reading time attribute (optional)',
            show_prediction: 'Glucose forecast',
            relative_time: 'Show reading age instead of the clock',
            dim_by_age: 'Start fading before the reading is stale',
            color_thresholds: 'Colour-coded glucose zones',
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
    eo: {
        card: {
            name: 'SugarTV Card',
            description:
                'Montras CGM-glukozajn datumojn kun tendenco, ŝanĝo kaj koloraj zonoj. Funkcias kun Dexcom, Nightscout, LibreView, LibreLink kaj Carelink.',
        },
        editor: {
            glucose_value: 'Glukoza sensilo',
            glucose_trend: 'Tendenca sensilo (aŭtomate detektita)',
            timestamp_attribute: 'Atributo de mezurtempo (nedeviga)',
            show_prediction: 'Glukoza prognozo',
            relative_time: 'Montri aĝon de mezuro anstataŭ horloĝon',
            dim_by_age: 'Komenci malheligi antaŭ ol la mezuro malfreŝiĝas',
            color_thresholds: 'Koloraj glukozaj zonoj',
            urgent_low: 'Kritike malalta',
            low: 'Malalta',
            high: 'Alta',
            urgent_high: 'Kritike alta',
            thresholds_title: 'Glukozaj sojloj (mg/dL aŭ mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Atendata kresko de pli ol {0} {1} en 15 minutoj',
            rise_in: 'Atendata kresko de {0} {1} en 15 minutoj',
            fall_over: 'Atendata falo de pli ol {0} {1} en 15 minutoj',
            fall_in: 'Atendata falo de {0} {1} en 15 minutoj',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    'es-419': {
        card: {
            name: 'SugarTV Card',
            description:
                'Muestra datos de glucosa MCG con tendencia, delta y zonas de color. Compatible con Dexcom, Nightscout, LibreView, LibreLink y Carelink.',
        },
        editor: {
            glucose_value: 'Sensor de glucosa',
            glucose_trend: 'Sensor de tendencia (detección automática)',
            timestamp_attribute: 'Atributo de la hora de medición (opcional)',
            show_prediction: 'Pronóstico de glucosa',
            relative_time: 'Mostrar la antigüedad en lugar de la hora',
            dim_by_age: 'Atenuar antes de que la medición caduque',
            color_thresholds: 'Zonas de glucosa por color',
            urgent_low: 'Muy bajo',
            low: 'Bajo',
            high: 'Alto',
            urgent_high: 'Muy alto',
            thresholds_title: 'Umbrales de glucosa (mg/dL o mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Se espera una subida de más de {0} {1} en 15 minutos',
            rise_in: 'Se espera una subida de {0} {1} en 15 minutos',
            fall_over: 'Se espera una bajada de más de {0} {1} en 15 minutos',
            fall_in: 'Se espera una bajada de {0} {1} en 15 minutos',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    et: {
        card: {
            name: 'SugarTV Card',
            description:
                'Kuvab CGM-i glükoosiandmeid trendi, muutuse ja värvitsoonidega. Töötab Dexcomi, Nightscouti, LibreView, LibreLinki ja Carelinkiga.',
        },
        editor: {
            glucose_value: 'Glükoosiandur',
            glucose_trend: 'Trendiandur (tuvastatakse automaatselt)',
            timestamp_attribute: 'Mõõtmisaja atribuut (valikuline)',
            show_prediction: 'Glükoosi prognoos',
            relative_time: 'Näita mõõtmise vanust kellaaja asemel',
            dim_by_age: 'Tumenda enne, kui mõõtmine aegub',
            color_thresholds: 'Värvilised glükoositsoonid',
            urgent_low: 'Kriitiliselt madal',
            low: 'Madal',
            high: 'Kõrge',
            urgent_high: 'Kriitiliselt kõrge',
            thresholds_title: 'Glükoosi piirid (mg/dL või mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Oodatav tõus üle {0} {1} võrra 15 minutiga',
            rise_in: 'Oodatav tõus {0} {1} võrra 15 minutiga',
            fall_over: 'Oodatav langus üle {0} {1} võrra 15 minutiga',
            fall_in: 'Oodatav langus {0} {1} võrra 15 minutiga',
        },
        common: {
            not_available: 'Puudub',
            default_time: '00:00',
        },
    },
    eu: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM glukosa datuak erakusten ditu joerarekin, aldaketarekin eta kolore eremuekin. Dexcom, Nightscout, LibreView, LibreLink eta Carelink-ekin dabil.',
        },
        editor: {
            glucose_value: 'Glukosa sentsorea',
            glucose_trend: 'Joera sentsorea (automatikoki hautemana)',
            timestamp_attribute: 'Neurketa orduaren atributua (aukerakoa)',
            show_prediction: 'Glukosa iragarpena',
            relative_time: 'Erakutsi neurketaren adina orduaren ordez',
            dim_by_age: 'Ilundu neurketa zaharkitu aurretik',
            color_thresholds: 'Koloretako glukosa eremuak',
            urgent_low: 'Oso baxua',
            low: 'Baxua',
            high: 'Altua',
            urgent_high: 'Oso altua',
            thresholds_title: 'Glukosa mugak (mg/dL edo mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '{0} {1} baino gehiagoko igoera espero da 15 minututan',
            rise_in: '{0} {1}-eko igoera espero da 15 minututan',
            fall_over:
                '{0} {1} baino gehiagoko jaitsiera espero da 15 minututan',
            fall_in: '{0} {1}-eko jaitsiera espero da 15 minututan',
        },
        common: {
            not_available: 'E/E',
            default_time: '00:00',
        },
    },
    fa: {
        card: {
            name: 'SugarTV Card',
            description:
                'داده‌های قند خون CGM را با روند، تغییر و نواحی رنگی نمایش می‌دهد. با Dexcom، Nightscout، LibreView، LibreLink و Carelink کار می‌کند.',
        },
        editor: {
            glucose_value: 'حسگر قند خون',
            glucose_trend: 'حسگر روند (تشخیص خودکار)',
            timestamp_attribute: 'ویژگی زمان اندازه‌گیری (اختیاری)',
            show_prediction: 'پیش‌بینی قند خون',
            relative_time: 'نمایش زمان سپری‌شده به جای ساعت',
            dim_by_age: 'شروع کم‌رنگ شدن پیش از کهنه شدن اندازه‌گیری',
            color_thresholds: 'نواحی رنگی قند خون',
            urgent_low: 'پایین بحرانی',
            low: 'پایین',
            high: 'بالا',
            urgent_high: 'بالا بحرانی',
            thresholds_title: 'آستانه‌های قند خون (mg/dL یا mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'افزایش بیش از {0} {1} در ۱۵ دقیقه پیش‌بینی می‌شود',
            rise_in: 'افزایش {0} {1} در ۱۵ دقیقه پیش‌بینی می‌شود',
            fall_over: 'کاهش بیش از {0} {1} در ۱۵ دقیقه پیش‌بینی می‌شود',
            fall_in: 'کاهش {0} {1} در ۱۵ دقیقه پیش‌بینی می‌شود',
        },
        common: {
            not_available: 'موجود نیست',
            default_time: '00:00',
        },
    },
    fi: {
        card: {
            name: 'SugarTV Card',
            description:
                "Näyttää CGM-glukoositiedot trendin, muutoksen ja värivyöhykkeiden kanssa. Toimii Dexcomin, Nightscoutin, LibreView'n, LibreLinkin ja Carelinkin kanssa.",
        },
        editor: {
            glucose_value: 'Glukoosianturi',
            glucose_trend: 'Trendianturi (tunnistetaan automaattisesti)',
            timestamp_attribute: 'Mittausajan attribuutti (valinnainen)',
            show_prediction: 'Glukoosiennuste',
            relative_time: 'Näytä mittauksen ikä kellonajan sijaan',
            dim_by_age: 'Himmennä ennen kuin mittaus vanhenee',
            color_thresholds: 'Väritetyt glukoosivyöhykkeet',
            urgent_low: 'Kriittisen matala',
            low: 'Matala',
            high: 'Korkea',
            urgent_high: 'Kriittisen korkea',
            thresholds_title: 'Glukoosirajat (mg/dL tai mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Odotettu nousu yli {0} {1} 15 minuutissa',
            rise_in: 'Odotettu nousu {0} {1} 15 minuutissa',
            fall_over: 'Odotettu lasku yli {0} {1} 15 minuutissa',
            fall_in: 'Odotettu lasku {0} {1} 15 minuutissa',
        },
        common: {
            not_available: 'Ei saat.',
            default_time: '00:00',
        },
    },
    fy: {
        card: {
            name: 'SugarTV Card',
            description:
                'Lit CGM-glukoazegegevens sjen mei trend, feroaring en kleurzônes. Wurket mei Dexcom, Nightscout, LibreView, LibreLink en Carelink.',
        },
        editor: {
            glucose_value: 'Glukoazesensor',
            glucose_trend: 'Trendsensor (automatysk fûn)',
            timestamp_attribute: 'Attribút fan de mjittiid (opsjoneel)',
            show_prediction: 'Glukoazeferwachting',
            relative_time: 'Toan âldens fan de mjitting ynstee fan de klok',
            dim_by_age: 'Dimme foardat de mjitting ferâldere is',
            color_thresholds: 'Kleurde glukoazezônes',
            urgent_low: 'Tige leech',
            low: 'Leech',
            high: 'Heech',
            urgent_high: 'Tige heech',
            thresholds_title: 'Glukoazedrompels (mg/dL of mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Ferwachte stiging fan mear as {0} {1} yn 15 minuten',
            rise_in: 'Ferwachte stiging fan {0} {1} yn 15 minuten',
            fall_over: 'Ferwachte daling fan mear as {0} {1} yn 15 minuten',
            fall_in: 'Ferwachte daling fan {0} {1} yn 15 minuten',
        },
        common: {
            not_available: 'N.v.t.',
            default_time: '00:00',
        },
    },
    ga: {
        card: {
            name: 'SugarTV Card',
            description:
                'Taispeánann sé sonraí glúcóis CGM le treocht, athrú agus criosanna daite. Oibríonn sé le Dexcom, Nightscout, LibreView, LibreLink agus Carelink.',
        },
        editor: {
            glucose_value: 'Braiteoir glúcóis',
            glucose_trend: 'Braiteoir treochta (aimsithe go huathoibríoch)',
            timestamp_attribute: 'Aitreabúid am an tomhais (roghnach)',
            show_prediction: 'Réamhaisnéis glúcóis',
            relative_time: 'Taispeáin aois an tomhais in ionad an chloig',
            dim_by_age: 'Tosaigh ag lagú sula dtéann an léamh i seanaois',
            color_thresholds: 'Criosanna glúcóis daite',
            urgent_low: 'An-íseal',
            low: 'Íseal',
            high: 'Ard',
            urgent_high: 'An-ard',
            thresholds_title: 'Tairseacha glúcóis (mg/dL nó mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over:
                'Táthar ag súil le hardú níos mó ná {0} {1} i gceann 15 nóiméad',
            rise_in: 'Táthar ag súil le hardú {0} {1} i gceann 15 nóiméad',
            fall_over:
                'Táthar ag súil le titim níos mó ná {0} {1} i gceann 15 nóiméad',
            fall_in: 'Táthar ag súil le titim {0} {1} i gceann 15 nóiméad',
        },
        common: {
            not_available: 'N/B',
            default_time: '00:00',
        },
    },
    gl: {
        card: {
            name: 'SugarTV Card',
            description:
                'Mostra datos de glicosa CGM con tendencia, delta e zonas de cor. Funciona con Dexcom, Nightscout, LibreView, LibreLink e Carelink.',
        },
        editor: {
            glucose_value: 'Sensor de glicosa',
            glucose_trend: 'Sensor de tendencia (detectado automaticamente)',
            timestamp_attribute: 'Atributo da hora de medición (opcional)',
            show_prediction: 'Previsión de glicosa',
            relative_time: 'Amosar a antigüidade en lugar da hora',
            dim_by_age: 'Atenuar antes de que a medición caduque',
            color_thresholds: 'Zonas de glicosa por cor',
            urgent_low: 'Moi baixa',
            low: 'Baixa',
            high: 'Alta',
            urgent_high: 'Moi alta',
            thresholds_title: 'Limiares de glicosa (mg/dL ou mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Espérase unha subida de máis de {0} {1} en 15 minutos',
            rise_in: 'Espérase unha subida de {0} {1} en 15 minutos',
            fall_over: 'Espérase unha baixada de máis de {0} {1} en 15 minutos',
            fall_in: 'Espérase unha baixada de {0} {1} en 15 minutos',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    gsw: {
        card: {
            name: 'SugarTV Card',
            description:
                'Zeigt CGM-Glukosedate mit Trend, Delta und Farbzone. Funktioniert mit Dexcom, Nightscout, LibreView, LibreLink und Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Trendsensor (automatisch erkennt)',
            timestamp_attribute: 'Attribut vo de Mässziit (optional)',
            show_prediction: 'Glukoseprognose',
            relative_time: 'Alter vo de Mässig statt de Uhrziit zeige',
            dim_by_age: 'Abdunkle, bevor d Mässig veraltet isch',
            color_thresholds: 'Farbigi Glukosezone',
            urgent_low: 'Kritisch tüüf',
            low: 'Tüüf',
            high: 'Hoch',
            urgent_high: 'Kritisch hoch',
            thresholds_title: 'Glukosegränze (mg/dL oder mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Erwartete Aastig vo meh als {0} {1} i 15 Minute',
            rise_in: 'Erwartete Aastig vo {0} {1} i 15 Minute',
            fall_over: 'Erwartete Abfall vo meh als {0} {1} i 15 Minute',
            fall_in: 'Erwartete Abfall vo {0} {1} i 15 Minute',
        },
        common: {
            not_available: 'K/A',
            default_time: '00:00',
        },
    },
    he: {
        card: {
            name: 'SugarTV Card',
            description:
                'מציג נתוני גלוקוז מ-CGM עם מגמה, שינוי ואזורי צבע. עובד עם Dexcom, Nightscout, LibreView, LibreLink ו-Carelink.',
        },
        editor: {
            glucose_value: 'חיישן גלוקוז',
            glucose_trend: 'חיישן מגמה (זיהוי אוטומטי)',
            timestamp_attribute: 'מאפיין זמן המדידה (אופציונלי)',
            show_prediction: 'תחזית גלוקוז',
            relative_time: 'הצג את גיל המדידה במקום השעה',
            dim_by_age: 'להתחיל לעמעם לפני שהמדידה מתיישנת',
            color_thresholds: 'אזורי גלוקוז צבעוניים',
            urgent_low: 'נמוך קריטי',
            low: 'נמוך',
            high: 'גבוה',
            urgent_high: 'גבוה קריטי',
            thresholds_title: 'ספי גלוקוז (mg/dL או mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'צפויה עלייה של יותר מ-{0} {1} תוך 15 דקות',
            rise_in: 'צפויה עלייה של {0} {1} תוך 15 דקות',
            fall_over: 'צפויה ירידה של יותר מ-{0} {1} תוך 15 דקות',
            fall_in: 'צפויה ירידה של {0} {1} תוך 15 דקות',
        },
        common: {
            not_available: 'לא זמין',
            default_time: '00:00',
        },
    },
    hi: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM ग्लूकोज डेटा को रुझान, परिवर्तन और रंगीन क्षेत्रों के साथ दिखाता है। Dexcom, Nightscout, LibreView, LibreLink और Carelink के साथ काम करता है।',
        },
        editor: {
            glucose_value: 'ग्लूकोज सेंसर',
            glucose_trend: 'रुझान सेंसर (स्वतः पहचाना गया)',
            timestamp_attribute: 'माप समय विशेषता (वैकल्पिक)',
            show_prediction: 'ग्लूकोज पूर्वानुमान',
            relative_time: 'घड़ी के बजाय माप की आयु दिखाएँ',
            dim_by_age: 'माप पुराना होने से पहले धुँधला करना शुरू करें',
            color_thresholds: 'रंगीन ग्लूकोज क्षेत्र',
            urgent_low: 'अत्यधिक कम',
            low: 'कम',
            high: 'उच्च',
            urgent_high: 'अत्यधिक उच्च',
            thresholds_title: 'ग्लूकोज सीमाएँ (mg/dL या mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '15 मिनट में {0} {1} से अधिक वृद्धि की उम्मीद है',
            rise_in: '15 मिनट में {0} {1} वृद्धि की उम्मीद है',
            fall_over: '15 मिनट में {0} {1} से अधिक गिरावट की उम्मीद है',
            fall_in: '15 मिनट में {0} {1} गिरावट की उम्मीद है',
        },
        common: {
            not_available: 'उपलब्ध नहीं',
            default_time: '00:00',
        },
    },
    hr: {
        card: {
            name: 'SugarTV Card',
            description:
                'Prikazuje podatke o glukozi CGM s trendom, promjenom i zonama u boji. Radi s Dexcom, Nightscout, LibreView, LibreLink i Carelink.',
        },
        editor: {
            glucose_value: 'Senzor glukoze',
            glucose_trend: 'Senzor trenda (automatski otkriven)',
            timestamp_attribute: 'Atribut vremena mjerenja (neobavezno)',
            show_prediction: 'Prognoza glukoze',
            relative_time: 'Prikaži starost mjerenja umjesto sata',
            dim_by_age: 'Priguši prije nego mjerenje zastari',
            color_thresholds: 'Obojene zone glukoze',
            urgent_low: 'Kritično nisko',
            low: 'Nisko',
            high: 'Visoko',
            urgent_high: 'Kritično visoko',
            thresholds_title: 'Pragovi glukoze (mg/dL ili mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Očekuje se porast veći od {0} {1} za 15 minuta',
            rise_in: 'Očekuje se porast od {0} {1} za 15 minuta',
            fall_over: 'Očekuje se pad veći od {0} {1} za 15 minuta',
            fall_in: 'Očekuje se pad od {0} {1} za 15 minuta',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    hu: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM vércukoradatokat jelenít meg trenddel, változással és színes zónákkal. Működik Dexcom, Nightscout, LibreView, LibreLink és Carelink rendszerrel.',
        },
        editor: {
            glucose_value: 'Vércukorszenzor',
            glucose_trend: 'Trendszenzor (automatikusan felismert)',
            timestamp_attribute: 'A mérés idejének attribútuma (opcionális)',
            show_prediction: 'Vércukor-előrejelzés',
            relative_time: 'A mérés kora az óra helyett',
            dim_by_age: 'Halványítás, mielőtt a mérés elavul',
            color_thresholds: 'Színes vércukorzónák',
            urgent_low: 'Kritikusan alacsony',
            low: 'Alacsony',
            high: 'Magas',
            urgent_high: 'Kritikusan magas',
            thresholds_title: 'Vércukorküszöbök (mg/dL vagy mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Várhatóan több mint {0} {1} emelkedés 15 perc alatt',
            rise_in: 'Várhatóan {0} {1} emelkedés 15 perc alatt',
            fall_over: 'Várhatóan több mint {0} {1} csökkenés 15 perc alatt',
            fall_in: 'Várhatóan {0} {1} csökkenés 15 perc alatt',
        },
        common: {
            not_available: 'N/A',
            default_time: '00:00',
        },
    },
    hy: {
        card: {
            name: 'SugarTV Card',
            description:
                'Ցուցադրում է CGM գլյուկոզի տվյալները միտումով, փոփոխությամբ և գունավոր գոտիներով։ Աշխատում է Dexcom, Nightscout, LibreView, LibreLink և Carelink-ի հետ։',
        },
        editor: {
            glucose_value: 'Գլյուկոզի սենսոր',
            glucose_trend: 'Միտման սենսոր (հայտնաբերվում է ավտոմատ)',
            timestamp_attribute: 'Չափման ժամանակի հատկանիշ (ըստ ցանկության)',
            show_prediction: 'Գլյուկոզի կանխատեսում',
            relative_time: 'Ցուցադրել չափման վաղեմությունը ժամի փոխարեն',
            dim_by_age: 'Սկսել մթագնումը մինչ չափման հնանալը',
            color_thresholds: 'Գունավոր գլյուկոզի գոտիներ',
            urgent_low: 'Կրիտիկական ցածր',
            low: 'Ցածր',
            high: 'Բարձր',
            urgent_high: 'Կրիտիկական բարձր',
            thresholds_title: 'Գլյուկոզի շեմեր (mg/dL կամ mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Սպասվում է աճ ավելի քան {0} {1} 15 րոպեում',
            rise_in: 'Սպասվում է աճ {0} {1} 15 րոպեում',
            fall_over: 'Սպասվում է անկում ավելի քան {0} {1} 15 րոպեում',
            fall_in: 'Սպասվում է անկում {0} {1} 15 րոպեում',
        },
        common: {
            not_available: 'Չկա',
            default_time: '00:00',
        },
    },
    id: {
        card: {
            name: 'SugarTV Card',
            description:
                'Menampilkan data glukosa CGM dengan tren, perubahan, dan zona warna. Bekerja dengan Dexcom, Nightscout, LibreView, LibreLink, dan Carelink.',
        },
        editor: {
            glucose_value: 'Sensor glukosa',
            glucose_trend: 'Sensor tren (terdeteksi otomatis)',
            timestamp_attribute: 'Atribut waktu pengukuran (opsional)',
            show_prediction: 'Prakiraan glukosa',
            relative_time: 'Tampilkan usia pengukuran alih-alih jam',
            dim_by_age: 'Mulai meredup sebelum pembacaan usang',
            color_thresholds: 'Zona glukosa berwarna',
            urgent_low: 'Sangat rendah',
            low: 'Rendah',
            high: 'Tinggi',
            urgent_high: 'Sangat tinggi',
            thresholds_title: 'Ambang glukosa (mg/dL atau mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Diperkirakan naik lebih dari {0} {1} dalam 15 menit',
            rise_in: 'Diperkirakan naik {0} {1} dalam 15 menit',
            fall_over: 'Diperkirakan turun lebih dari {0} {1} dalam 15 menit',
            fall_in: 'Diperkirakan turun {0} {1} dalam 15 menit',
        },
        common: {
            not_available: 'T/A',
            default_time: '00:00',
        },
    },
    is: {
        card: {
            name: 'SugarTV Card',
            description:
                'Sýnir CGM blóðsykurgögn með þróun, breytingu og litasvæðum. Virkar með Dexcom, Nightscout, LibreView, LibreLink og Carelink.',
        },
        editor: {
            glucose_value: 'Blóðsykursskynjari',
            glucose_trend: 'Þróunarskynjari (greindur sjálfkrafa)',
            timestamp_attribute: 'Eigindi mælingartíma (valfrjálst)',
            show_prediction: 'Blóðsykursspá',
            relative_time: 'Sýna aldur mælingar í stað klukku',
            dim_by_age: 'Deyfa áður en mælingin úreldist',
            color_thresholds: 'Litakóðuð blóðsykurssvæði',
            urgent_low: 'Hættulega lágur',
            low: 'Lágur',
            high: 'Hár',
            urgent_high: 'Hættulega hár',
            thresholds_title: 'Blóðsykursmörk (mg/dL eða mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Búist við hækkun um meira en {0} {1} á 15 mínútum',
            rise_in: 'Búist við hækkun um {0} {1} á 15 mínútum',
            fall_over: 'Búist við lækkun um meira en {0} {1} á 15 mínútum',
            fall_in: 'Búist við lækkun um {0} {1} á 15 mínútum',
        },
        common: {
            not_available: 'Á ekki við',
            default_time: '00:00',
        },
    },
    ja: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGMの血糖データをトレンド、変化量、カラーゾーンとともに表示します。Dexcom、Nightscout、LibreView、LibreLink、Carelinkに対応。',
        },
        editor: {
            glucose_value: '血糖センサー',
            glucose_trend: 'トレンドセンサー（自動検出）',
            timestamp_attribute: '測定時刻の属性（任意）',
            show_prediction: '血糖予測',
            relative_time: '時刻の代わりに経過時間を表示',
            dim_by_age: '測定が古くなる前から淡く表示',
            color_thresholds: '血糖ゾーンの色分け',
            urgent_low: '危険な低値',
            low: '低値',
            high: '高値',
            urgent_high: '危険な高値',
            thresholds_title: '血糖しきい値（mg/dL または mmol/L）',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '15分で{0} {1}以上の上昇が見込まれます',
            rise_in: '15分で{0} {1}の上昇が見込まれます',
            fall_over: '15分で{0} {1}以上の下降が見込まれます',
            fall_in: '15分で{0} {1}の下降が見込まれます',
        },
        common: {
            not_available: '該当なし',
            default_time: '00:00',
        },
    },
    ka: {
        card: {
            name: 'SugarTV Card',
            description:
                'აჩვენებს CGM გლუკოზის მონაცემებს ტენდენციით, ცვლილებით და ფერადი ზონებით. მუშაობს Dexcom, Nightscout, LibreView, LibreLink და Carelink-თან.',
        },
        editor: {
            glucose_value: 'გლუკოზის სენსორი',
            glucose_trend: 'ტენდენციის სენსორი (ავტომატურად აღმოჩენილი)',
            timestamp_attribute: 'გაზომვის დროის ატრიბუტი (არასავალდებულო)',
            show_prediction: 'გლუკოზის პროგნოზი',
            relative_time: 'აჩვენე გაზომვის ასაკი საათის ნაცვლად',
            dim_by_age: 'ჩაქრობის დაწყება გაზომვის დაძველებამდე',
            color_thresholds: 'ფერადი გლუკოზის ზონები',
            urgent_low: 'კრიტიკულად დაბალი',
            low: 'დაბალი',
            high: 'მაღალი',
            urgent_high: 'კრიტიკულად მაღალი',
            thresholds_title: 'გლუკოზის ზღვრები (mg/dL ან mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'მოსალოდნელია მატება {0} {1}-ზე მეტით 15 წუთში',
            rise_in: 'მოსალოდნელია მატება {0} {1}-ით 15 წუთში',
            fall_over: 'მოსალოდნელია კლება {0} {1}-ზე მეტით 15 წუთში',
            fall_in: 'მოსალოდნელია კლება {0} {1}-ით 15 წუთში',
        },
        common: {
            not_available: 'მიუწვდ.',
            default_time: '00:00',
        },
    },
    ko: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM 혈당 데이터를 추세, 변화량, 색상 구역과 함께 표시합니다. Dexcom, Nightscout, LibreView, LibreLink, Carelink를 지원합니다.',
        },
        editor: {
            glucose_value: '혈당 센서',
            glucose_trend: '추세 센서 (자동 감지)',
            timestamp_attribute: '측정 시각 속성 (선택 사항)',
            show_prediction: '혈당 예측',
            relative_time: '시계 대신 측정 경과 시간 표시',
            dim_by_age: '측정이 오래되기 전부터 흐리게 표시',
            color_thresholds: '색상으로 구분된 혈당 구역',
            urgent_low: '위험 저혈당',
            low: '저혈당',
            high: '고혈당',
            urgent_high: '위험 고혈당',
            thresholds_title: '혈당 임계값 (mg/dL 또는 mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '15분 내 {0} {1} 이상 상승 예상',
            rise_in: '15분 내 {0} {1} 상승 예상',
            fall_over: '15분 내 {0} {1} 이상 하강 예상',
            fall_in: '15분 내 {0} {1} 하강 예상',
        },
        common: {
            not_available: '없음',
            default_time: '00:00',
        },
    },
    lb: {
        card: {
            name: 'SugarTV Card',
            description:
                'Weist CGM-Glukosedaten mat Trend, Ännerung a Faarfzonen. Funktionéiert mat Dexcom, Nightscout, LibreView, LibreLink a Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Trendsensor (automatesch erkannt)',
            timestamp_attribute: 'Attribut vun der Moosszäit (fakultativ)',
            show_prediction: 'Glukoseprognos',
            relative_time: 'Alter vun der Miessung amplaz vun der Auer weisen',
            dim_by_age: "Ofdunkelen, ier d'Miessung verwent ass",
            color_thresholds: 'Faarweg Glukosezonen',
            urgent_low: 'Kritesch niddreg',
            low: 'Niddreg',
            high: 'Héich',
            urgent_high: 'Kritesch héich',
            thresholds_title: 'Glukosegrenzwäerter (mg/dL oder mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Erwaarten Ustig vu méi wéi {0} {1} an 15 Minutten',
            rise_in: 'Erwaarten Ustig vu {0} {1} an 15 Minutten',
            fall_over: 'Erwaarte Fall vu méi wéi {0} {1} an 15 Minutten',
            fall_in: 'Erwaarte Fall vu {0} {1} an 15 Minutten',
        },
        common: {
            not_available: 'N/A',
            default_time: '00:00',
        },
    },
    lt: {
        card: {
            name: 'SugarTV Card',
            description:
                'Rodo CGM gliukozės duomenis su tendencija, pokyčiu ir spalvų zonomis. Veikia su Dexcom, Nightscout, LibreView, LibreLink ir Carelink.',
        },
        editor: {
            glucose_value: 'Gliukozės jutiklis',
            glucose_trend: 'Tendencijos jutiklis (aptinkamas automatiškai)',
            timestamp_attribute: 'Matavimo laiko atributas (nebūtinas)',
            show_prediction: 'Gliukozės prognozė',
            relative_time: 'Rodyti matavimo amžių vietoj laikrodžio',
            dim_by_age: 'Pradėti temdyti prieš matavimui pasenstant',
            color_thresholds: 'Spalvotos gliukozės zonos',
            urgent_low: 'Kritiškai žema',
            low: 'Žema',
            high: 'Aukšta',
            urgent_high: 'Kritiškai aukšta',
            thresholds_title: 'Gliukozės ribos (mg/dL arba mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Tikimasi padidėjimo daugiau nei {0} {1} per 15 minučių',
            rise_in: 'Tikimasi padidėjimo {0} {1} per 15 minučių',
            fall_over: 'Tikimasi sumažėjimo daugiau nei {0} {1} per 15 minučių',
            fall_in: 'Tikimasi sumažėjimo {0} {1} per 15 minučių',
        },
        common: {
            not_available: 'Nėra',
            default_time: '00:00',
        },
    },
    lv: {
        card: {
            name: 'SugarTV Card',
            description:
                'Rāda CGM glikozes datus ar tendenci, izmaiņām un krāsu zonām. Darbojas ar Dexcom, Nightscout, LibreView, LibreLink un Carelink.',
        },
        editor: {
            glucose_value: 'Glikozes sensors',
            glucose_trend: 'Tendences sensors (nosaka automātiski)',
            timestamp_attribute: 'Mērījuma laika atribūts (neobligāts)',
            show_prediction: 'Glikozes prognoze',
            relative_time: 'Rādīt mērījuma vecumu, nevis pulksteni',
            dim_by_age: 'Sākt aptumšot, pirms mērījums novecojis',
            color_thresholds: 'Krāsainās glikozes zonas',
            urgent_low: 'Kritiski zems',
            low: 'Zems',
            high: 'Augsts',
            urgent_high: 'Kritiski augsts',
            thresholds_title: 'Glikozes sliekšņi (mg/dL vai mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Paredzams pieaugums par vairāk nekā {0} {1} 15 minūtēs',
            rise_in: 'Paredzams pieaugums par {0} {1} 15 minūtēs',
            fall_over: 'Paredzams kritums par vairāk nekā {0} {1} 15 minūtēs',
            fall_in: 'Paredzams kritums par {0} {1} 15 minūtēs',
        },
        common: {
            not_available: 'Nav pieejams',
            default_time: '00:00',
        },
    },
    mk: {
        card: {
            name: 'SugarTV Card',
            description:
                'Прикажува податоци за гликоза CGM со тренд, промена и обоени зони. Работи со Dexcom, Nightscout, LibreView, LibreLink и Carelink.',
        },
        editor: {
            glucose_value: 'Сензор за гликоза',
            glucose_trend: 'Сензор за тренд (автоматски откриен)',
            timestamp_attribute: 'Атрибут за време на мерење (опционално)',
            show_prediction: 'Прогноза за гликоза',
            relative_time: 'Прикажи старост на мерењето наместо часовникот',
            dim_by_age: 'Почни затемнување пред мерењето да застари',
            color_thresholds: 'Обоени зони на гликоза',
            urgent_low: 'Критично ниско',
            low: 'Ниско',
            high: 'Високо',
            urgent_high: 'Критично високо',
            thresholds_title: 'Прагови на гликоза (mg/dL или mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Се очекува пораст поголем од {0} {1} за 15 минути',
            rise_in: 'Се очекува пораст од {0} {1} за 15 минути',
            fall_over: 'Се очекува пад поголем од {0} {1} за 15 минути',
            fall_in: 'Се очекува пад од {0} {1} за 15 минути',
        },
        common: {
            not_available: 'Н/Д',
            default_time: '00:00',
        },
    },
    ml: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM ഗ്ലൂക്കോസ് ഡാറ്റ പ്രവണത, മാറ്റം, വർണ്ണ മേഖലകൾ എന്നിവയോടെ കാണിക്കുന്നു. Dexcom, Nightscout, LibreView, LibreLink, Carelink എന്നിവയുമായി പ്രവർത്തിക്കുന്നു.',
        },
        editor: {
            glucose_value: 'ഗ്ലൂക്കോസ് സെൻസർ',
            glucose_trend: 'പ്രവണത സെൻസർ (സ്വയമേവ കണ്ടെത്തുന്നു)',
            timestamp_attribute:
                'അളവെടുപ്പ് സമയത്തിന്റെ ആട്രിബ്യൂട്ട് (ഓപ്ഷണൽ)',
            show_prediction: 'ഗ്ലൂക്കോസ് പ്രവചനം',
            relative_time: 'ക്ലോക്കിനു പകരം അളവെടുപ്പിന്റെ പഴക്കം കാണിക്കുക',
            dim_by_age: 'അളവ് പഴകുന്നതിന് മുമ്പേ മങ്ങിക്കാൻ തുടങ്ങുക',
            color_thresholds: 'വർണ്ണ ഗ്ലൂക്കോസ് മേഖലകൾ',
            urgent_low: 'അതീവ കുറവ്',
            low: 'കുറവ്',
            high: 'കൂടുതൽ',
            urgent_high: 'അതീവ കൂടുതൽ',
            thresholds_title: 'ഗ്ലൂക്കോസ് പരിധികൾ (mg/dL അല്ലെങ്കിൽ mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '15 മിനിറ്റിൽ {0} {1}-ൽ കൂടുതൽ വർധന പ്രതീക്ഷിക്കുന്നു',
            rise_in: '15 മിനിറ്റിൽ {0} {1} വർധന പ്രതീക്ഷിക്കുന്നു',
            fall_over: '15 മിനിറ്റിൽ {0} {1}-ൽ കൂടുതൽ കുറവ് പ്രതീക്ഷിക്കുന്നു',
            fall_in: '15 മിനിറ്റിൽ {0} {1} കുറവ് പ്രതീക്ഷിക്കുന്നു',
        },
        common: {
            not_available: 'ലഭ്യമല്ല',
            default_time: '00:00',
        },
    },
    nb: {
        card: {
            name: 'SugarTV Card',
            description:
                'Viser CGM-glukosedata med trend, delta og fargesoner. Fungerer med Dexcom, Nightscout, LibreView, LibreLink og Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Trendsensor (oppdages automatisk)',
            timestamp_attribute: 'Attributt for måletidspunkt (valgfritt)',
            show_prediction: 'Glukoseprognose',
            relative_time: 'Vis målingens alder i stedet for klokkeslett',
            dim_by_age: 'Demp før målingen blir foreldet',
            color_thresholds: 'Fargede glukosesoner',
            urgent_low: 'Kritisk lav',
            low: 'Lav',
            high: 'Høy',
            urgent_high: 'Kritisk høy',
            thresholds_title: 'Glukosegrenser (mg/dL eller mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Forventet økning på mer enn {0} {1} på 15 minutter',
            rise_in: 'Forventet økning på {0} {1} på 15 minutter',
            fall_over: 'Forventet fall på mer enn {0} {1} på 15 minutter',
            fall_in: 'Forventet fall på {0} {1} på 15 minutter',
        },
        common: {
            not_available: 'Ikke tilgj.',
            default_time: '00:00',
        },
    },
    nn: {
        card: {
            name: 'SugarTV Card',
            description:
                'Viser CGM-glukosedata med trend, delta og fargesoner. Fungerer med Dexcom, Nightscout, LibreView, LibreLink og Carelink.',
        },
        editor: {
            glucose_value: 'Glukosesensor',
            glucose_trend: 'Trendsensor (blir oppdaga automatisk)',
            timestamp_attribute: 'Attributt for måletidspunkt (valfritt)',
            show_prediction: 'Glukoseprognose',
            relative_time: 'Vis alderen på målinga i staden for klokkeslett',
            dim_by_age: 'Demp før målinga blir forelda',
            color_thresholds: 'Farga glukosesoner',
            urgent_low: 'Kritisk låg',
            low: 'Låg',
            high: 'Høg',
            urgent_high: 'Kritisk høg',
            thresholds_title: 'Glukosegrenser (mg/dL eller mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Venta auke på meir enn {0} {1} på 15 minutt',
            rise_in: 'Venta auke på {0} {1} på 15 minutt',
            fall_over: 'Venta fall på meir enn {0} {1} på 15 minutt',
            fall_in: 'Venta fall på {0} {1} på 15 minutt',
        },
        common: {
            not_available: 'Ikkje tilgj.',
            default_time: '00:00',
        },
    },
    'pt-BR': {
        card: {
            name: 'SugarTV Card',
            description:
                'Exibe dados de glicose CGM com tendência, delta e zonas coloridas. Funciona com Dexcom, Nightscout, LibreView, LibreLink e Carelink.',
        },
        editor: {
            glucose_value: 'Sensor de glicose',
            glucose_trend: 'Sensor de tendência (detectado automaticamente)',
            timestamp_attribute: 'Atributo da hora da medição (opcional)',
            show_prediction: 'Previsão de glicose',
            relative_time: 'Mostrar há quanto tempo em vez da hora',
            dim_by_age: 'Atenuar antes de a medição ficar desatualizada',
            color_thresholds: 'Zonas de glicose coloridas',
            urgent_low: 'Muito baixo',
            low: 'Baixo',
            high: 'Alto',
            urgent_high: 'Muito alto',
            thresholds_title: 'Limites de glicose (mg/dL ou mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Previsto aumento de mais de {0} {1} em 15 minutos',
            rise_in: 'Previsto aumento de {0} {1} em 15 minutos',
            fall_over: 'Prevista queda de mais de {0} {1} em 15 minutos',
            fall_in: 'Prevista queda de {0} {1} em 15 minutos',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    ro: {
        card: {
            name: 'SugarTV Card',
            description:
                'Afișează date despre glicemie CGM cu tendință, variație și zone colorate. Funcționează cu Dexcom, Nightscout, LibreView, LibreLink și Carelink.',
        },
        editor: {
            glucose_value: 'Senzor de glicemie',
            glucose_trend: 'Senzor de tendință (detectat automat)',
            timestamp_attribute: 'Atributul orei măsurării (opțional)',
            show_prediction: 'Prognoza glicemiei',
            relative_time: 'Afișează vechimea măsurării în loc de oră',
            dim_by_age: 'Estompează înainte ca măsurarea să expire',
            color_thresholds: 'Zone de glicemie colorate',
            urgent_low: 'Critic scăzută',
            low: 'Scăzută',
            high: 'Ridicată',
            urgent_high: 'Critic ridicată',
            thresholds_title: 'Praguri de glicemie (mg/dL sau mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Se așteaptă o creștere de peste {0} {1} în 15 minute',
            rise_in: 'Se așteaptă o creștere de {0} {1} în 15 minute',
            fall_over: 'Se așteaptă o scădere de peste {0} {1} în 15 minute',
            fall_in: 'Se așteaptă o scădere de {0} {1} în 15 minute',
        },
        common: {
            not_available: 'Indisp.',
            default_time: '00:00',
        },
    },
    sk: {
        card: {
            name: 'SugarTV Card',
            description:
                'Zobrazuje údaje glykémie CGM s trendom, deltou a farebnými zónami. Funguje s Dexcom, Nightscout, LibreView, LibreLink a Carelink.',
        },
        editor: {
            glucose_value: 'Senzor glykémie',
            glucose_trend: 'Senzor trendu (zistený automaticky)',
            timestamp_attribute: 'Atribút času merania (voliteľné)',
            show_prediction: 'Predpoveď glykémie',
            relative_time: 'Zobraziť vek merania namiesto času',
            dim_by_age: 'Stlmiť skôr, než meranie zostarne',
            color_thresholds: 'Farebné zóny glykémie',
            urgent_low: 'Kriticky nízka',
            low: 'Nízka',
            high: 'Vysoká',
            urgent_high: 'Kriticky vysoká',
            thresholds_title: 'Prahy glykémie (mg/dL alebo mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Očakáva sa vzostup o viac ako {0} {1} za 15 minút',
            rise_in: 'Očakáva sa vzostup o {0} {1} za 15 minút',
            fall_over: 'Očakáva sa pokles o viac ako {0} {1} za 15 minút',
            fall_in: 'Očakáva sa pokles o {0} {1} za 15 minút',
        },
        common: {
            not_available: 'N/A',
            default_time: '00:00',
        },
    },
    sl: {
        card: {
            name: 'SugarTV Card',
            description:
                'Prikazuje podatke o glukozi CGM s trendom, spremembo in barvnimi območji. Deluje z Dexcom, Nightscout, LibreView, LibreLink in Carelink.',
        },
        editor: {
            glucose_value: 'Senzor glukoze',
            glucose_trend: 'Senzor trenda (samodejno zaznan)',
            timestamp_attribute: 'Atribut časa meritve (izbirno)',
            show_prediction: 'Napoved glukoze',
            relative_time: 'Prikaži starost meritve namesto ure',
            dim_by_age: 'Zatemni, preden meritev zastara',
            color_thresholds: 'Barvna območja glukoze',
            urgent_low: 'Kritično nizko',
            low: 'Nizko',
            high: 'Visoko',
            urgent_high: 'Kritično visoko',
            thresholds_title: 'Mejne vrednosti glukoze (mg/dL ali mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Pričakovan dvig za več kot {0} {1} v 15 minutah',
            rise_in: 'Pričakovan dvig za {0} {1} v 15 minutah',
            fall_over: 'Pričakovan padec za več kot {0} {1} v 15 minutah',
            fall_in: 'Pričakovan padec za {0} {1} v 15 minutah',
        },
        common: {
            not_available: 'Ni na voljo',
            default_time: '00:00',
        },
    },
    sq: {
        card: {
            name: 'SugarTV Card',
            description:
                'Shfaq të dhënat e glukozës CGM me tendencë, ndryshim dhe zona me ngjyra. Funksionon me Dexcom, Nightscout, LibreView, LibreLink dhe Carelink.',
        },
        editor: {
            glucose_value: 'Sensori i glukozës',
            glucose_trend: 'Sensori i tendencës (zbulohet automatikisht)',
            timestamp_attribute: 'Atributi i kohës së matjes (opsional)',
            show_prediction: 'Parashikimi i glukozës',
            relative_time: 'Shfaq moshën e matjes në vend të orës',
            dim_by_age: 'Fillo zbehjen para se matja të vjetrohet',
            color_thresholds: 'Zona me ngjyra të glukozës',
            urgent_low: 'Kritikisht e ulët',
            low: 'E ulët',
            high: 'E lartë',
            urgent_high: 'Kritikisht e lartë',
            thresholds_title: 'Pragjet e glukozës (mg/dL ose mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Pritet rritje me më shumë se {0} {1} në 15 minuta',
            rise_in: 'Pritet rritje me {0} {1} në 15 minuta',
            fall_over: 'Pritet rënie me më shumë se {0} {1} në 15 minuta',
            fall_in: 'Pritet rënie me {0} {1} në 15 minuta',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    sr: {
        card: {
            name: 'SugarTV Card',
            description:
                'Приказује податке о глукози CGM са трендом, променом и обојеним зонама. Ради са Dexcom, Nightscout, LibreView, LibreLink и Carelink.',
        },
        editor: {
            glucose_value: 'Сензор глукозе',
            glucose_trend: 'Сензор тренда (аутоматски откривен)',
            timestamp_attribute: 'Атрибут времена мерења (опционо)',
            show_prediction: 'Прогноза глукозе',
            relative_time: 'Прикажи старост мерења уместо сата',
            dim_by_age: 'Почни пригушивање пре него мерење застари',
            color_thresholds: 'Обојене зоне глукозе',
            urgent_low: 'Критично ниско',
            low: 'Ниско',
            high: 'Високо',
            urgent_high: 'Критично високо',
            thresholds_title: 'Прагови глукозе (mg/dL или mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Очекује се пораст већи од {0} {1} за 15 минута',
            rise_in: 'Очекује се пораст од {0} {1} за 15 минута',
            fall_over: 'Очекује се пад већи од {0} {1} за 15 минута',
            fall_in: 'Очекује се пад од {0} {1} за 15 минута',
        },
        common: {
            not_available: 'Н/Д',
            default_time: '00:00',
        },
    },
    'sr-Latn': {
        card: {
            name: 'SugarTV Card',
            description:
                'Prikazuje podatke o glukozi CGM sa trendom, promenom i obojenim zonama. Radi sa Dexcom, Nightscout, LibreView, LibreLink i Carelink.',
        },
        editor: {
            glucose_value: 'Senzor glukoze',
            glucose_trend: 'Senzor trenda (automatski otkriven)',
            timestamp_attribute: 'Atribut vremena merenja (opciono)',
            show_prediction: 'Prognoza glukoze',
            relative_time: 'Prikaži starost merenja umesto sata',
            dim_by_age: 'Počni prigušivanje pre nego merenje zastari',
            color_thresholds: 'Obojene zone glukoze',
            urgent_low: 'Kritično nisko',
            low: 'Nisko',
            high: 'Visoko',
            urgent_high: 'Kritično visoko',
            thresholds_title: 'Pragovi glukoze (mg/dL ili mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Očekuje se porast veći od {0} {1} za 15 minuta',
            rise_in: 'Očekuje se porast od {0} {1} za 15 minuta',
            fall_over: 'Očekuje se pad veći od {0} {1} za 15 minuta',
            fall_in: 'Očekuje se pad od {0} {1} za 15 minuta',
        },
        common: {
            not_available: 'N/D',
            default_time: '00:00',
        },
    },
    ta: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM குளுக்கோஸ் தரவை போக்கு, மாற்றம் மற்றும் வண்ண மண்டலங்களுடன் காட்டுகிறது. Dexcom, Nightscout, LibreView, LibreLink மற்றும் Carelink உடன் இயங்கும்.',
        },
        editor: {
            glucose_value: 'குளுக்கோஸ் உணரி',
            glucose_trend: 'போக்கு உணரி (தானாகக் கண்டறியப்படும்)',
            timestamp_attribute: 'அளவீட்டு நேரப் பண்பு (விருப்பத்தேர்வு)',
            show_prediction: 'குளுக்கோஸ் முன்னறிவிப்பு',
            relative_time: 'கடிகாரத்திற்குப் பதிலாக அளவீட்டின் வயதைக் காட்டு',
            dim_by_age: 'அளவீடு பழையதாகும் முன்பே மங்கலாக்கத் தொடங்கு',
            color_thresholds: 'வண்ண குளுக்கோஸ் மண்டலங்கள்',
            urgent_low: 'மிகக் குறைவு',
            low: 'குறைவு',
            high: 'அதிகம்',
            urgent_high: 'மிக அதிகம்',
            thresholds_title: 'குளுக்கோஸ் வரம்புகள் (mg/dL அல்லது mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over:
                '15 நிமிடங்களில் {0} {1}-க்கு மேல் உயர்வு எதிர்பார்க்கப்படுகிறது',
            rise_in: '15 நிமிடங்களில் {0} {1} உயர்வு எதிர்பார்க்கப்படுகிறது',
            fall_over:
                '15 நிமிடங்களில் {0} {1}-க்கு மேல் வீழ்ச்சி எதிர்பார்க்கப்படுகிறது',
            fall_in: '15 நிமிடங்களில் {0} {1} வீழ்ச்சி எதிர்பார்க்கப்படுகிறது',
        },
        common: {
            not_available: 'இல்லை',
            default_time: '00:00',
        },
    },
    te: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM గ్లూకోజ్ డేటాను ధోరణి, మార్పు మరియు రంగు మండలాలతో చూపుతుంది. Dexcom, Nightscout, LibreView, LibreLink మరియు Carelink తో పనిచేస్తుంది.',
        },
        editor: {
            glucose_value: 'గ్లూకోజ్ సెన్సార్',
            glucose_trend: 'ధోరణి సెన్సార్ (స్వయంచాలకంగా గుర్తించబడింది)',
            timestamp_attribute: 'కొలత సమయ లక్షణం (ఐచ్ఛికం)',
            show_prediction: 'గ్లూకోజ్ అంచనా',
            relative_time: 'గడియారానికి బదులుగా కొలత వయస్సును చూపు',
            dim_by_age: 'కొలత పాతబడక ముందే మసకబరచడం ప్రారంభించు',
            color_thresholds: 'రంగు గ్లూకోజ్ మండలాలు',
            urgent_low: 'అత్యంత తక్కువ',
            low: 'తక్కువ',
            high: 'ఎక్కువ',
            urgent_high: 'అత్యంత ఎక్కువ',
            thresholds_title: 'గ్లూకోజ్ పరిమితులు (mg/dL లేదా mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '15 నిమిషాల్లో {0} {1} కంటే ఎక్కువ పెరుగుదల అంచనా',
            rise_in: '15 నిమిషాల్లో {0} {1} పెరుగుదల అంచనా',
            fall_over: '15 నిమిషాల్లో {0} {1} కంటే ఎక్కువ తగ్గుదల అంచనా',
            fall_in: '15 నిమిషాల్లో {0} {1} తగ్గుదల అంచనా',
        },
        common: {
            not_available: 'అందుబాటులో లేదు',
            default_time: '00:00',
        },
    },
    th: {
        card: {
            name: 'SugarTV Card',
            description:
                'แสดงข้อมูลระดับน้ำตาลจาก CGM พร้อมแนวโน้ม การเปลี่ยนแปลง และโซนสี ใช้ได้กับ Dexcom, Nightscout, LibreView, LibreLink และ Carelink',
        },
        editor: {
            glucose_value: 'เซ็นเซอร์น้ำตาลในเลือด',
            glucose_trend: 'เซ็นเซอร์แนวโน้ม (ตรวจพบอัตโนมัติ)',
            timestamp_attribute: 'แอตทริบิวต์เวลาที่วัด (ไม่บังคับ)',
            show_prediction: 'การคาดการณ์ระดับน้ำตาล',
            relative_time: 'แสดงอายุของค่าที่วัดแทนนาฬิกา',
            dim_by_age: 'เริ่มหรี่ก่อนที่ค่าที่วัดจะเก่า',
            color_thresholds: 'โซนสีระดับน้ำตาล',
            urgent_low: 'ต่ำวิกฤต',
            low: 'ต่ำ',
            high: 'สูง',
            urgent_high: 'สูงวิกฤต',
            thresholds_title: 'เกณฑ์ระดับน้ำตาล (mg/dL หรือ mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'คาดว่าจะเพิ่มขึ้นมากกว่า {0} {1} ใน 15 นาที',
            rise_in: 'คาดว่าจะเพิ่มขึ้น {0} {1} ใน 15 นาที',
            fall_over: 'คาดว่าจะลดลงมากกว่า {0} {1} ใน 15 นาที',
            fall_in: 'คาดว่าจะลดลง {0} {1} ใน 15 นาที',
        },
        common: {
            not_available: 'ไม่มีข้อมูล',
            default_time: '00:00',
        },
    },
    tr: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM glukoz verilerini eğilim, değişim ve renkli bölgelerle gösterir. Dexcom, Nightscout, LibreView, LibreLink ve Carelink ile çalışır.',
        },
        editor: {
            glucose_value: 'Glukoz sensörü',
            glucose_trend: 'Eğilim sensörü (otomatik algılanır)',
            timestamp_attribute: 'Ölçüm zamanı özniteliği (isteğe bağlı)',
            show_prediction: 'Glukoz tahmini',
            relative_time: 'Saat yerine ölçümün yaşını göster',
            dim_by_age: 'Ölçüm eskimeden soluklaştırmaya başla',
            color_thresholds: 'Renkli glukoz bölgeleri',
            urgent_low: 'Kritik düşük',
            low: 'Düşük',
            high: 'Yüksek',
            urgent_high: 'Kritik yüksek',
            thresholds_title: 'Glukoz eşikleri (mg/dL veya mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over:
                '15 dakikada {0} {1} değerinden fazla yükselme bekleniyor',
            rise_in: '15 dakikada {0} {1} yükselme bekleniyor',
            fall_over: '15 dakikada {0} {1} değerinden fazla düşme bekleniyor',
            fall_in: '15 dakikada {0} {1} düşme bekleniyor',
        },
        common: {
            not_available: 'Yok',
            default_time: '00:00',
        },
    },
    ur: {
        card: {
            name: 'SugarTV Card',
            description:
                'CGM گلوکوز ڈیٹا کو رجحان، تبدیلی اور رنگین زونز کے ساتھ دکھاتا ہے۔ Dexcom، Nightscout، LibreView، LibreLink اور Carelink کے ساتھ کام کرتا ہے۔',
        },
        editor: {
            glucose_value: 'گلوکوز سینسر',
            glucose_trend: 'رجحان سینسر (خودکار طور پر پہچانا گیا)',
            timestamp_attribute: 'پیمائش کے وقت کی خصوصیت (اختیاری)',
            show_prediction: 'گلوکوز کی پیش گوئی',
            relative_time: 'گھڑی کے بجائے پیمائش کی عمر دکھائیں',
            dim_by_age: 'پیمائش پرانی ہونے سے پہلے دھندلانا شروع کریں',
            color_thresholds: 'رنگین گلوکوز زونز',
            urgent_low: 'انتہائی کم',
            low: 'کم',
            high: 'زیادہ',
            urgent_high: 'انتہائی زیادہ',
            thresholds_title: 'گلوکوز کی حدود (mg/dL یا mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '15 منٹ میں {0} {1} سے زیادہ اضافے کی توقع ہے',
            rise_in: '15 منٹ میں {0} {1} اضافے کی توقع ہے',
            fall_over: '15 منٹ میں {0} {1} سے زیادہ کمی کی توقع ہے',
            fall_in: '15 منٹ میں {0} {1} کمی کی توقع ہے',
        },
        common: {
            not_available: 'دستیاب نہیں',
            default_time: '00:00',
        },
    },
    vi: {
        card: {
            name: 'SugarTV Card',
            description:
                'Hiển thị dữ liệu đường huyết CGM với xu hướng, mức thay đổi và vùng màu. Hoạt động với Dexcom, Nightscout, LibreView, LibreLink và Carelink.',
        },
        editor: {
            glucose_value: 'Cảm biến đường huyết',
            glucose_trend: 'Cảm biến xu hướng (tự động phát hiện)',
            timestamp_attribute: 'Thuộc tính thời gian đo (tùy chọn)',
            show_prediction: 'Dự báo đường huyết',
            relative_time: 'Hiển thị thời gian trôi qua thay vì giờ',
            dim_by_age: 'Bắt đầu làm mờ trước khi số đo cũ',
            color_thresholds: 'Vùng đường huyết theo màu',
            urgent_low: 'Rất thấp',
            low: 'Thấp',
            high: 'Cao',
            urgent_high: 'Rất cao',
            thresholds_title: 'Ngưỡng đường huyết (mg/dL hoặc mmol/L)',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: 'Dự kiến tăng hơn {0} {1} trong 15 phút',
            rise_in: 'Dự kiến tăng {0} {1} trong 15 phút',
            fall_over: 'Dự kiến giảm hơn {0} {1} trong 15 phút',
            fall_in: 'Dự kiến giảm {0} {1} trong 15 phút',
        },
        common: {
            not_available: 'Không có',
            default_time: '00:00',
        },
    },
    'zh-Hans': {
        card: {
            name: 'SugarTV Card',
            description:
                '显示 CGM 血糖数据，包含趋势、变化量和颜色分区。支持 Dexcom、Nightscout、LibreView、LibreLink 和 Carelink。',
        },
        editor: {
            glucose_value: '血糖传感器',
            glucose_trend: '趋势传感器（自动检测）',
            timestamp_attribute: '测量时间属性（可选）',
            show_prediction: '血糖预测',
            relative_time: '显示读数经过时间而非时钟',
            dim_by_age: '在读数变旧前就开始淡化',
            color_thresholds: '彩色血糖分区',
            urgent_low: '极低',
            low: '偏低',
            high: '偏高',
            urgent_high: '极高',
            thresholds_title: '血糖阈值（mg/dL 或 mmol/L）',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '预计 15 分钟内上升超过 {0} {1}',
            rise_in: '预计 15 分钟内上升 {0} {1}',
            fall_over: '预计 15 分钟内下降超过 {0} {1}',
            fall_in: '预计 15 分钟内下降 {0} {1}',
        },
        common: {
            not_available: '无数据',
            default_time: '00:00',
        },
    },
    'zh-Hant': {
        card: {
            name: 'SugarTV Card',
            description:
                '顯示 CGM 血糖資料，包含趨勢、變化量與顏色分區。支援 Dexcom、Nightscout、LibreView、LibreLink 與 Carelink。',
        },
        editor: {
            glucose_value: '血糖感測器',
            glucose_trend: '趨勢感測器（自動偵測）',
            timestamp_attribute: '量測時間屬性（選填）',
            show_prediction: '血糖預測',
            relative_time: '顯示讀數經過時間而非時鐘',
            dim_by_age: '在讀數變舊前就開始淡化',
            color_thresholds: '彩色血糖分區',
            urgent_low: '極低',
            low: '偏低',
            high: '偏高',
            urgent_high: '極高',
            thresholds_title: '血糖閾值（mg/dL 或 mmol/L）',
        },
        units: {
            mgdl: 'mg/dL',
            mmoll: 'mmol/L',
        },
        predictions: {
            rise_over: '預計 15 分鐘內上升超過 {0} {1}',
            rise_in: '預計 15 分鐘內上升 {0} {1}',
            fall_over: '預計 15 分鐘內下降超過 {0} {1}',
            fall_in: '預計 15 分鐘內下降 {0} {1}',
        },
        common: {
            not_available: '無資料',
            default_time: '00:00',
        },
    },
};

/**
 * Pick the closest table Home Assistant's language tag has.
 *
 * The exact tag has to win before the base one. Several of Home Assistant's
 * languages only exist in a qualified form: taking the part before the hyphen
 * turns zh-Hans into zh, which no table has, and Simplified Chinese would fall
 * back to English while a perfectly good translation sat unused. The base is
 * still the right second guess, so that de-AT reads German and pt-PT reads
 * Portuguese.
 */
function resolveLanguage(tag) {
    if (languages[tag]) return languages[tag];
    const base = tag.split('-')[0];
    return languages[base] || languages.en;
}

/**
 * The language Home Assistant's own interface is running in.
 *
 * Two of the card's surfaces are reached without a hass, so both used to fall
 * through to English: getConfigForm is static, and window.customCards is filled
 * at module load, long before a hass exists. That left 14 of the card's 22
 * strings unreadable in any of the 64 languages they are translated into.
 *
 * The root element is the way in. `home-assistant` is a real custom element
 * holding the hass object, and the card picker reads a custom card's name and
 * description as properties while it renders rather than when the entry is
 * registered, so a getter is evaluated late enough to find one.
 *
 * Undefined is the honest answer when there is no frontend around it, which is
 * every test and the demo page; getLocalizer falls back to English from there.
 */
export function frontendLanguage() {
    if (typeof document === 'undefined') return undefined;
    const hass = document.querySelector('home-assistant')?.hass;
    return hass?.locale?.language || hass?.language;
}

export function getLocalizer(config, hass) {
    const lang = (config && config.locale) || (hass && hass.language) || 'en';
    const table = resolveLanguage(lang);

    return function (string, ...args) {
        let translated;
        try {
            translated = string.split('.').reduce((o, i) => o[i], table);
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

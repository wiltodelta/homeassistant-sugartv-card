import { describe, it, expect } from 'vitest';
import { frontendLanguage, getLocalizer, languages } from '../src/localize.js';
import haLanguages from './ha-languages.json';

/*
 * Check the tables directly rather than through the localizer, because the
 * localizer falls back to English on a missing key: the card keeps working and
 * a stray English label just sits there in an otherwise translated editor.
 * Only the raw table shows the hole.
 */
const KEYS = [
    'card.name',
    'card.description',
    'editor.glucose_value',
    'editor.glucose_trend',
    'editor.timestamp_attribute',
    'editor.show_prediction',
    'editor.relative_time',
    'editor.color_thresholds',
    'editor.urgent_low',
    'editor.low',
    'editor.high',
    'editor.urgent_high',
    'editor.thresholds_title',
    'units.mgdl',
    'units.mmoll',
    'predictions.rise_over',
    'predictions.rise_in',
    'predictions.fall_over',
    'predictions.fall_in',
    'common.not_available',
    'common.default_time',
];

const PREDICTIONS = [
    'predictions.rise_over',
    'predictions.rise_in',
    'predictions.fall_over',
    'predictions.fall_in',
];

const at = (table, path) => path.split('.').reduce((o, k) => o?.[k], table);
const codes = Object.keys(languages);

describe('translation coverage', () => {
    /*
     * ha-languages.json is a snapshot of Home Assistant's own
     * translationMetadata.json. Home Assistant adds languages over time, so
     * this is the test that goes red and names the ones that are new.
     */
    it('covers every language Home Assistant ships', () => {
        expect(codes.slice().sort()).toEqual(haLanguages.slice().sort());
    });

    it.each(codes)('%s defines every key', (code) => {
        const missing = KEYS.filter(
            (key) => typeof at(languages[code], key) !== 'string',
        );

        expect(missing).toEqual([]);
    });

    it.each(codes)('%s has no empty string', (code) => {
        const blank = KEYS.filter((key) => !at(languages[code], key)?.trim());

        expect(blank).toEqual([]);
    });
});

describe('forecast placeholders', () => {
    /*
     * Both slots have to survive translation. Lose {0} and the forecast drops
     * the number it is about; leave it unsubstituted and the card renders a
     * literal "{0}" to someone reading their glucose.
     */
    it.each(codes)('%s keeps both slots in every forecast', (code) => {
        for (const key of PREDICTIONS) {
            const text = at(languages[code], key);
            expect(text, `${code} ${key}`).toContain('{0}');
            expect(text, `${code} ${key}`).toContain('{1}');
        }
    });

    it.each(codes)('%s substitutes cleanly', (code) => {
        const t = getLocalizer({ locale: code }, {});

        for (const key of PREDICTIONS) {
            expect(t(key, '30-45', 'mg/dL'), `${code} ${key}`).not.toMatch(
                /\{\d\}/,
            );
        }
    });
});

describe('language resolution', () => {
    /*
     * Several of Home Assistant's tags only exist qualified. Taking the part
     * before the hyphen turns zh-Hans into zh, which no table has, and
     * Simplified Chinese would silently read English.
     */
    it.each(['zh-Hans', 'zh-Hant', 'pt-BR', 'es-419', 'sr-Latn', 'en-GB'])(
        'resolves %s to its own table, not to a base language',
        (tag) => {
            expect(getLocalizer({ locale: tag }, {})('editor.low')).toBe(
                languages[tag].editor.low,
            );
        },
    );

    it('falls back to the base language for an unlisted region', () => {
        expect(getLocalizer({ locale: 'de-AT' }, {})('editor.low')).toBe(
            'Niedrig',
        );
    });

    it('falls back to English for a language it does not ship', () => {
        expect(getLocalizer({ locale: 'tlh' }, {})('editor.low')).toBe('Low');
    });

    it('prefers the configured locale over the Home Assistant language', () => {
        const t = getLocalizer({ locale: 'de' }, { language: 'fr' });

        expect(t('editor.low')).toBe('Niedrig');
    });
});

/*
 * The card's editor labels and its entry in the card picker are reached without
 * a hass, so before #101 both were English in all 64 languages. The language has
 * to come off the frontend's own root element instead.
 */
describe('frontendLanguage', () => {
    const withRoot = (hass, run) => {
        const previous = globalThis.document;
        globalThis.document = {
            querySelector: (sel) =>
                sel === 'home-assistant' ? { hass } : null,
        };
        try {
            return run();
        } finally {
            globalThis.document = previous;
        }
    };

    it('reads the profile language off the root element', () => {
        expect(withRoot({ locale: { language: 'de' } }, frontendLanguage)).toBe(
            'de',
        );
    });

    /*
     * hass.locale is the user's profile and hass.language the interface, and
     * the profile wins, the same order the card itself resolves them in.
     */
    it('prefers the profile over the interface language', () => {
        expect(
            withRoot(
                { locale: { language: 'de' }, language: 'fr' },
                frontendLanguage,
            ),
        ).toBe('de');
    });

    it('falls back to the interface language when there is no profile', () => {
        expect(withRoot({ language: 'fr' }, frontendLanguage)).toBe('fr');
    });

    it.each([
        ['there is no root element', undefined],
        ['the root element has no hass yet', {}],
    ])('answers undefined when %s', (_label, hass) => {
        const previous = globalThis.document;
        globalThis.document = {
            querySelector: () => (hass === undefined ? null : { hass }),
        };
        try {
            expect(frontendLanguage()).toBeUndefined();
        } finally {
            globalThis.document = previous;
        }
    });

    it('answers undefined off a frontend entirely, as in the demo', () => {
        const previous = globalThis.document;
        // eslint-disable-next-line no-undef
        delete globalThis.document;
        try {
            expect(frontendLanguage()).toBeUndefined();
        } finally {
            globalThis.document = previous;
        }
    });

    it('drives the localizer, so a German frontend gets German labels', () => {
        const previous = globalThis.document;
        globalThis.document = {
            querySelector: () => ({ hass: { locale: { language: 'de' } } }),
        };
        try {
            const t = getLocalizer({}, { language: frontendLanguage() });
            expect(t('editor.low')).toBe(languages.de.editor.low);
        } finally {
            globalThis.document = previous;
        }
    });
});

import { describe, it, expect } from 'vitest';
import { getLocalizer, languages } from '../src/localize.js';
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

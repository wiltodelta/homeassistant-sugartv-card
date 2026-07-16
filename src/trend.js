// Object id tails of each integration's glucose value sensor. Shared so the
// trend and reading-time lookups cannot drift apart: an id is slugified from
// the integration's entity NAME, never from its internal key, which is how the
// Carelink tails below were wrong (last_sg_mgdl) until 2026-07.
export const VALUE_SUFFIXES = {
    dexcom: 'glucose_value',
    carelinkMgdl: 'last_glucose_level_mg_dl',
    carelinkMmol: 'last_glucose_level_mmol',
    librelink: 'glucose_measurement',
};

// Resolve a sibling entity by swapping the tail of an entity id, keeping
// whatever head the install happens to have.
//
// The head is not predictable. HA builds the object id from the entity's name,
// and what goes into that name has changed: a Carelink install from before
// 2026-02 is plain `sensor.last_glucose_level_mg_dl`, a later one carries the
// patient name, and since HA 2026.4 an entity without has_entity_name also gets
// the device name prepended, which doubles it. All three must resolve, so match
// the tail and rebuild the head rather than assuming a prefix.
export function siblingEntityId(entityId, valueTail, siblingTail) {
    const dot = entityId.indexOf('.');
    if (dot === -1) return null;

    const domain = entityId.slice(0, dot);
    const objectId = entityId.slice(dot + 1);

    if (objectId === valueTail) {
        return `${domain}.${siblingTail}`;
    }
    if (objectId.endsWith(`_${valueTail}`)) {
        const head = objectId.slice(0, -valueTail.length);
        return `${domain}.${head}${siblingTail}`;
    }
    return null;
}

// Normalize trend values from different CGM integrations to internal format
export const TREND_MAP = {
    // Dexcom (already normalized)
    rising_quickly: 'rising_quickly',
    rising: 'rising',
    rising_slightly: 'rising_slightly',
    steady: 'steady',
    falling_slightly: 'falling_slightly',
    falling: 'falling',
    falling_quickly: 'falling_quickly',
    // Nightscout direction values
    doubleup: 'rising_quickly',
    singleup: 'rising',
    fortyfiveup: 'rising_slightly',
    flat: 'steady',
    fortyfivedown: 'falling_slightly',
    singledown: 'falling',
    doubledown: 'falling_quickly',
    // LibreView numeric trends
    2: 'rising_quickly',
    3: 'rising',
    4: 'rising_slightly',
    5: 'steady',
    6: 'falling_slightly',
    7: 'falling',
    8: 'falling_quickly',
    // LibreView/PTST (attribute 'trend' — snake_case)
    'rising quickly': 'rising_quickly',
    'rising slightly': 'rising_slightly',
    stable: 'steady',
    'falling slightly': 'falling_slightly',
    'falling quickly': 'falling_quickly',
    decreasing_fast: 'falling_quickly',
    decreasing: 'falling',
    increasing: 'rising',
    increasing_fast: 'rising_quickly',
    // LibreLink/gillesvs (separate trend entity — human-readable text)
    'decreasing fast': 'falling_quickly',
    'increasing fast': 'rising_quickly',
    // Carelink/Medtronic trend values (raw API: UP, DOWN, FLAT)
    up: 'rising',
    up_up: 'rising_quickly',
    up_double: 'rising_quickly',
    down: 'falling',
    down_down: 'falling_quickly',
    down_double: 'falling_quickly',
    none: 'steady',
};

export function normalizeTrend(rawTrend) {
    if (!rawTrend) return 'unknown';
    const key = String(rawTrend).toLowerCase().trim();
    // HA system states are not real trends
    if (key === 'unknown' || key === 'unavailable') return 'unknown';
    return TREND_MAP[key] || key;
}

/**
 * Auto-detect trend from multiple sources:
 * 1. YAML override: config.glucose_trend entity
 * 2. Sibling entity patterns:
 *    - Dexcom: *_glucose_value → *_glucose_trend
 *    - Carelink: *_last_glucose_level_mg_dl / *_last_glucose_level_mmol →
 *      *_last_glucose_trend (the *_last_sg_* spelling is the integration's
 *      internal keys, which never became entity ids)
 *    - LibreLink (gillesvs): *_glucose_measurement → find *_trend entity
 * 3. Nightscout: attribute 'direction' on value entity
 * 4. LibreView (PTST): attribute 'trend' on value entity
 * 5. Fallback: 'unknown'
 */
export function resolveTrend(glucose_value, glucoseState, config, hass) {
    // 1. YAML override
    if (config.glucose_trend) {
        const trendState = hass.states[config.glucose_trend];
        if (trendState) {
            return normalizeTrend(trendState.state);
        }
    }

    // 2. Sibling entity patterns
    const siblingPatterns = [
        // Dexcom: sensor.dexcom_*_glucose_value → sensor.dexcom_*_glucose_trend
        [VALUE_SUFFIXES.dexcom, 'glucose_trend'],
        [VALUE_SUFFIXES.carelinkMgdl, 'last_glucose_trend'],
        [VALUE_SUFFIXES.carelinkMmol, 'last_glucose_trend'],
        // Kept for installs whose entities were renamed to the key spelling.
        ['last_sg_mgdl', 'last_sg_trend'],
        ['last_sg_mmol', 'last_sg_trend'],
    ];

    for (const [valueTail, trendTail] of siblingPatterns) {
        const trendEntityId = siblingEntityId(
            glucose_value,
            valueTail,
            trendTail,
        );
        if (!trendEntityId) continue;

        const trendState = hass.states[trendEntityId];
        if (trendState) {
            return normalizeTrend(trendState.state);
        }
    }

    // LibreLink (gillesvs): entities share a prefix, trend entity has key "_trend"
    // e.g. sensor.*_glucose_measurement + sensor.*_trend
    const prefix = glucose_value.substring(0, glucose_value.lastIndexOf('_'));
    if (prefix) {
        const trendState = hass.states[`${prefix}_trend`];
        if (trendState) {
            return normalizeTrend(trendState.state);
        }
    }

    // 3. Nightscout: 'direction' attribute
    if (glucoseState.attributes?.direction) {
        return normalizeTrend(glucoseState.attributes.direction);
    }

    // 4. LibreView (PTST): 'trend' attribute
    if (glucoseState.attributes?.trend) {
        return normalizeTrend(String(glucoseState.attributes.trend));
    }

    return 'unknown';
}

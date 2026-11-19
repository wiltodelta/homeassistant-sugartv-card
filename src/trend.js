// Object id tails of each integration's glucose value sensor. Shared so the
// trend and reading-time lookups cannot drift apart: an id is slugified from
// the integration's entity NAME, never from its internal key, which is how the
// Carelink tails below were wrong (last_sg_mgdl) until 2026-07.
export const VALUE_SUFFIXES = {
    dexcom: 'glucose_value',
    carelinkMgdl: 'last_glucose_level_mg_dl',
    carelinkMmol: 'last_glucose_level_mmol',
    librelink: 'glucose_measurement',
    librelinkDodog: 'measurement',
    glucose: 'glucose',
    nocturne: 'current_glucose',
    nightscoutV3: 'bg_current',
    bloodGlucose: 'blood_glucose',
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
    // Nightscout direction values (and Nightscout Extended snake_case states)
    doubleup: 'rising_quickly',
    double_up: 'rising_quickly',
    singleup: 'rising',
    single_up: 'rising',
    fortyfiveup: 'rising_slightly',
    forty_five_up: 'rising_slightly',
    flat: 'steady',
    fortyfivedown: 'falling_slightly',
    forty_five_down: 'falling_slightly',
    singledown: 'falling',
    single_down: 'falling',
    doubledown: 'falling_quickly',
    double_down: 'falling_quickly',
    // LibreView numeric trends
    2: 'rising_quickly',
    3: 'rising',
    4: 'rising_slightly',
    5: 'steady',
    6: 'falling_slightly',
    7: 'falling',
    8: 'falling_quickly',
    // LibreView/PTST (attribute 'trend' — snake_case) and Medtrum EasyView
    'rising quickly': 'rising_quickly',
    'rising slightly': 'rising_slightly',
    stable: 'steady',
    'falling slightly': 'falling_slightly',
    'falling quickly': 'falling_quickly',
    decreasing_very_fast: 'falling_quickly',
    decreasing_fast: 'falling_quickly',
    decreasing: 'falling',
    increasing: 'rising',
    increasing_fast: 'rising_quickly',
    increasing_very_fast: 'rising_quickly',
    // LibreLink/gillesvs (separate trend entity — human-readable text)
    'decreasing fast': 'falling_quickly',
    'increasing fast': 'rising_quickly',
    // LibreLink/dodog (separate trend entity) and Sugar Sense (snake_case)
    'rising fast': 'rising_quickly',
    rising_fast: 'rising_quickly',
    'falling fast': 'falling_quickly',
    falling_fast: 'falling_quickly',
    // LibreLinkUp/rumpelbaer (separate trend entity)
    rising_rapidly: 'rising_quickly',
    falling_rapidly: 'falling_quickly',
    // Carelink/Medtronic trend values (raw API: UP, DOWN, FLAT)
    up: 'rising',
    up_up: 'rising_quickly',
    up_double: 'rising_quickly',
    down: 'falling',
    down_down: 'falling_quickly',
    down_double: 'falling_quickly',
    // No direction. Nightscout, Nightscout Extended, Nocturne and LibreLinkUp
    // publish these when there is no arrow to draw. Carelink's NONE means the
    // opposite, a change too slow for an arrow, so it gets its own map.
    none: 'unknown',
    'not computable': 'unknown',
    notcomputable: 'unknown',
    not_computable: 'unknown',
    'rate out of range': 'unknown',
    rateoutofrange: 'unknown',
    rate_out_of_range: 'unknown',
    not_determined: 'unknown',
};

export const CARELINK_TREND_MAP = { ...TREND_MAP, none: 'steady' };

export function normalizeTrend(rawTrend, map = TREND_MAP) {
    if (!rawTrend) return 'unknown';
    const key = String(rawTrend).toLowerCase().trim();
    // HA system states are not real trends
    if (key === 'unknown' || key === 'unavailable') return 'unknown';
    return (
        map[key] ||
        /*
         * A direction decorated with a trailing glyph still names a trend:
         * danudaru/HA_Nightscout publishes `direction` as "FortyFiveUp ↗",
         * word plus icon, and the undecorated lookup missed both. The word is
         * the datum and the glyph is presentation, so strip anything that is
         * neither a word character nor a space (the map itself carries keys
         * with spaces, like "rising quickly") and ask again.
         */
        map[key.replace(/[^\s\w]+/g, '').trim()] ||
        key
    );
}

const MGDL_PER_MMOL = 18.0182;

export function isRateSensor(stateObj) {
    const unit = stateObj?.attributes?.unit_of_measurement;
    return typeof unit === 'string' && /\/min$/i.test(unit.trim());
}

/**
 * Derive a standard 7-arrow CGM trend from a rate-of-change sensor (mg/dL/min
 * or mmol/L/min), matching Dexcom/Tandem's 1, 2 and 3 mg/dL/min thresholds and
 * the 15-minute forecast ranges in _getTrendDescriptions.
 */
export function trendFromRate(stateObj) {
    const trimmed = String(stateObj?.state ?? '').trim();
    if (!trimmed) return 'unknown';

    const rate = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(rate)) return 'unknown';

    const unit = stateObj?.attributes?.unit_of_measurement || '';
    const rateMgdl = /mmol/i.test(unit) ? rate * MGDL_PER_MMOL : rate;
    const abs = Math.abs(rateMgdl);
    const up = rateMgdl > 0;

    if (abs < 1) return 'steady';
    if (abs < 2) return up ? 'rising_slightly' : 'falling_slightly';
    if (abs <= 3) return up ? 'rising' : 'falling';
    return up ? 'rising_quickly' : 'falling_quickly';
}

function trendFromEntity(entityId, stateObj) {
    if (
        isRateSensor(stateObj) ||
        /(^|[._])(cgm_)?rate_of_change$/.test(entityId)
    ) {
        return trendFromRate(stateObj);
    }
    const carelink = /(^|[._])last_(glucose|sg)_trend$/.test(entityId);
    return normalizeTrend(
        stateObj.state,
        carelink ? CARELINK_TREND_MAP : TREND_MAP,
    );
}

const SIBLING_PATTERNS = [
    // Dexcom: sensor.*_glucose_value → sensor.*_glucose_trend
    [VALUE_SUFFIXES.dexcom, 'glucose_trend'],
    [VALUE_SUFFIXES.carelinkMgdl, 'last_glucose_trend'],
    [VALUE_SUFFIXES.carelinkMmol, 'last_glucose_trend'],
    // Kept for installs whose entities were renamed to the key spelling.
    ['last_sg_mgdl', 'last_sg_trend'],
    ['last_sg_mmol', 'last_sg_trend'],
    [VALUE_SUFFIXES.nocturne, 'glucose_trend'],
    [VALUE_SUFFIXES.nightscoutV3, 'bg_direction'],
    [VALUE_SUFFIXES.bloodGlucose, 'glucose_trend'],
    [VALUE_SUFFIXES.bloodGlucose, 'bg_direction'],
    [VALUE_SUFFIXES.glucose, 'trend'],
    [VALUE_SUFFIXES.glucose, 'glucose_trend'],
    // Rate-of-change siblings (Tandem Source, Glucifer without *_trend).
    [VALUE_SUFFIXES.carelinkMgdl, 'cgm_rate_of_change'],
    [VALUE_SUFFIXES.carelinkMmol, 'cgm_rate_of_change'],
    [VALUE_SUFFIXES.glucose, 'rate_of_change'],
];

/**
 * Auto-detect trend from multiple sources:
 * 1. The trend sensor picked in the editor (config.glucose_trend), either a
 *    word/code trend or a rate-of-change sensor (* /min)
 * 2. Sibling entity patterns (SIBLING_PATTERNS) and prefix *_trend lookup:
 *    - Dexcom: *_glucose_value → *_glucose_trend
 *    - Carelink: *_last_glucose_level_mg_dl / *_last_glucose_level_mmol →
 *      *_last_glucose_trend (the *_last_sg_* spelling is the integration's
 *      internal keys, which never became entity ids)
 *    - Nocturne: *_current_glucose → *_glucose_trend (Nightscout words)
 *    - Nightscout v3: *_bg_current → *_bg_direction
 *    - Gluroo: *_blood_glucose → *_glucose_trend
 *    - Nightscout Extended (kleinig): *_blood_glucose → *_bg_direction
 *    - LibreLinkUp (rumpelbaer), Sugar Sense, Glucifer: *_glucose → *_trend
 *    - Nightscout Extended, Medtrum EasyView: *_glucose → *_glucose_trend
 *    - Tandem: *_last_glucose_level_mg_dl / *_mmol → *_cgm_rate_of_change
 *    - Glucifer (when *_trend is absent): *_glucose → *_rate_of_change
 *    - LibreLink (dodog): *_measurement → *_trend
 * 3. Nightscout / Gluroo: attribute 'direction' on value entity
 * 4. LibreView (PTST): attribute 'trend' on value entity
 * 5. Fallback: 'unknown'
 */
export function resolveTrend(glucose_value, glucoseState, config, hass) {
    // 1. The picked trend sensor.
    if (config.glucose_trend) {
        const trendState = hass.states[config.glucose_trend];
        if (trendState) {
            return trendFromEntity(config.glucose_trend, trendState);
        }
    }

    // 2. Sibling entity patterns
    for (const [valueTail, trendTail] of SIBLING_PATTERNS) {
        const trendEntityId = siblingEntityId(
            glucose_value,
            valueTail,
            trendTail,
        );
        if (!trendEntityId) continue;

        const trendState = hass.states[trendEntityId];
        if (trendState) {
            return trendFromEntity(trendEntityId, trendState);
        }
    }

    // Prefix *_trend fallback (e.g. sensor.*_measurement → sensor.*_trend)
    const prefix = glucose_value.substring(0, glucose_value.lastIndexOf('_'));
    if (prefix) {
        const trendEntityId = `${prefix}_trend`;
        const trendState = hass.states[trendEntityId];
        if (trendState) {
            return trendFromEntity(trendEntityId, trendState);
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

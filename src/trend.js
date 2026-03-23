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
 *    - Carelink: *_last_sg_mgdl / *_last_sg_mmol → *_last_sg_trend
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
        ['_glucose_value', '_glucose_trend'],
        // Carelink: sensor.carelink_*_last_sg_mgdl → sensor.carelink_*_last_sg_trend
        ['_last_sg_mgdl', '_last_sg_trend'],
        ['_last_sg_mmol', '_last_sg_trend'],
    ];

    for (const [valueSuffix, trendSuffix] of siblingPatterns) {
        if (glucose_value.endsWith(valueSuffix)) {
            const trendEntityId = glucose_value.replace(
                valueSuffix,
                trendSuffix,
            );
            const trendState = hass.states[trendEntityId];
            if (trendState) {
                return normalizeTrend(trendState.state);
            }
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
    if (glucoseState.attributes.direction) {
        return normalizeTrend(glucoseState.attributes.direction);
    }

    // 4. LibreView (PTST): 'trend' attribute
    if (glucoseState.attributes.trend) {
        return normalizeTrend(String(glucoseState.attributes.trend));
    }

    return 'unknown';
}

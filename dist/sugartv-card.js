/* SugarTV Card version 0.6.2 */
import{css as t,LitElement as e,html as i}from"https://unpkg.com/lit-element@2.5.1/lit-element.js?module";const s=t`            
    :host, .card {
        display: flex;
        height: 100%;
        width: 100%;
        font-family: 'Roboto', sans-serif;
        container-type: inline-size;
    }
    
    .wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
    }
    
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1;
        padding: 5cqi;
        box-sizing: border-box;
    }

    .main-row {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .time {
        font-size: 6cqi;
    }
    
    .value {
        font-size: 20cqi;
        margin: 0 2.5cqi;
    }
    
    .trend {
        font-size: 10cqi;
        font-family: 'overpass';
        margin: 0 2.5cqi 0 0;
    }
    
    .delta {
        font-size: 6cqi;
    }

    .prediction {
        font-size: 2.7cqi;
        margin-top: 2cqi;
        opacity: 0.7;
        text-align: center;
    }
`,a=t`
    ha-select {
        width: 100%;
        margin-bottom: 8px;
    }
    .values {
        padding: 8px 0;
    }
    .card-config {
        padding: 16px;
    }
`;customElements.define("sugartv-card-editor",class extends e{static get properties(){return{hass:{type:Object},_config:{type:Object}}}setConfig(t){this._config=t}get _glucose_value(){return this._config.glucose_value||""}get _glucose_trend(){return this._config.glucose_trend||""}_valueChanged(t){if(!this._config||!this.hass)return;const e=t.target,i="show_prediction"===e.configValue?e.checked:e.value;if(this[`_${e.configValue}`]===i)return;const s={...this._config,[e.configValue]:i},a=new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0});this.dispatchEvent(a)}render(){if(!this.hass||!this._config)return i``;const t=Object.keys(this.hass.states).filter((t=>0===t.indexOf("sensor.")));return i`
            <div class="card-config">
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="Glucose value (required)"
                        .configValue=${"glucose_value"}
                        .value=${this._glucose_value}
                        @selected=${this._valueChanged}
                        @closed=${t=>t.stopPropagation()}
                    >
                        ${t.map((t=>i`
                            <ha-list-item .value=${t}>
                                ${t}
                            </ha-list-item>
                        `))}
                    </ha-select>
                </div>

                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="Glucose trend (required)"
                        .configValue=${"glucose_trend"}
                        .value=${this._glucose_trend}
                        @selected=${this._valueChanged}
                        @closed=${t=>t.stopPropagation()}
                    >
                        ${t.map((t=>i`
                            <ha-list-item .value=${t}>
                                ${t}
                            </ha-list-item>
                        `))}
                    </ha-select>
                </div>

                <div class="values">
                    <ha-formfield label="Show prediction">
                        <ha-switch
                            .checked=${!1!==this._config.show_prediction}
                            .configValue=${"show_prediction"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
            </div>
        `}static get styles(){return a}});const n="N/A",o="⧖",r="00:00",l="mg/dL";function c(t){const e=t===l;return{rising_quickly:{symbol:"↑↑",prediction:`Expected to rise over ${e?"45 mg/dL":"2.5 mmol/L"} in 15 minutes`},rising:{symbol:"↑",prediction:`Expected to rise ${e?"30-45 mg/dL":"1.7-2.5 mmol/L"} in 15 minutes`},rising_slightly:{symbol:"↗",prediction:`Expected to rise ${e?"15-30 mg/dL":"0.8-1.7 mmol/L"} in 15 minutes`},steady:{symbol:"→"},falling_slightly:{symbol:"↘",prediction:`Expected to fall ${e?"15-30 mg/dL":"0.8-1.7 mmol/L"} in 15 minutes`},falling:{symbol:"↓",prediction:`Expected to fall ${e?"30-45 mg/dL":"1.7-2.5 mmol/L"} in 15 minutes`},falling_quickly:{symbol:"↓↓",prediction:`Expected to fall over ${e?"45 mg/dL":"2.5 mmol/L"} in 15 minutes`},unknown:{symbol:"↻"}}}let d=c(l);["https://fonts.googleapis.com/css?family=Roboto:400,700&amp;subset=cyrillic,cyrillic-ext,latin-ext","https://overpass-30e2.kxcdn.com/overpass.css","https://overpass-30e2.kxcdn.com/overpass-mono.css"].forEach((function(t){const e=document.createElement("link");e.type="text/css",e.rel="stylesheet",e.href=t,document.head.appendChild(e)}));customElements.define("sugartv-card",class extends e{static get properties(){return{_hass:{},_config:{},_data:{}}}static getStubConfig(){return{type:"custom:sugartv-card",glucose_value:"sensor.dexcom_glucose_value",glucose_trend:"sensor.dexcom_glucose_trend",show_prediction:!0}}static async getConfigElement(){return document.createElement("sugartv-card-editor")}constructor(){super(),this._data=this._getInitialDataState()}_getInitialDataState(){return{value:null,last_changed:null,trend:null,unit:l,previous_value:null,previous_last_changed:null,previous_trend:null}}set hass(t){const e=this._hass;this._hass=t,this._hass&&this._updateData(e)}_updateData(t){const{glucose_value:e,glucose_trend:i}=this._config;if(!this._validateEntities(e,i))return;const s=this._getCurrentState(e,i);this._updateCurrentData(s),t&&this._updatePreviousData(t,e,i,s)}_validateEntities(t,e){return!(!this._hass.states[t]||!this._hass.states[e])||(console.error("SugarTV Card: One or both entities not found:",t,e),this._data={...this._getInitialDataState(),value:0,last_changed:0,trend:"unknown",unit:l},!1)}_getCurrentState(t,e){const i=this._hass.states[t],s=this._hass.states[e];return{value:i.state,unit:i.attributes.unit_of_measurement,last_changed:i.last_changed,trend:s.state}}_updateCurrentData(t){this._data.unit!==t.unit&&(d=c(t.unit||l),this._data.unit=t.unit),Object.assign(this._data,t)}_updatePreviousData(t,e,i,s){const a={previous_value:t.states[e].state,previous_last_changed:t.states[e].last_changed,previous_trend:t.states[i].state};s.last_changed!==a.previous_last_changed&&Object.assign(this._data,a)}_formatTime(t){return t&&"unknown"!==t&&"unavailable"!==t?new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):r}_calculateDelta(){const{value:t,previous_value:e,last_changed:i,previous_last_changed:s}=this._data;if(!this._isValidValue(t)||!this._isValidValue(e))return o;if(Math.abs(new Date(i)-new Date(s))>=45e4)return o;const a=t-e,n=Math.round(10*Math.abs(a))/10;return a>=0?`＋${n}`:`－${n}`}_isValidValue(t){return t&&"unknown"!==t&&"unavailable"!==t}_formatValue(t){if(!this._isValidValue(t))return n;const e=parseFloat(t);return isNaN(e)?n:e}render(){if(!this._hass||!this._config)return i``;const{value:t,last_changed:e,trend:s}=this._data,a=!1!==this._config.show_prediction,n=d[s]?.prediction||d.unknown.prediction;return i`
            <div class="wrapper">
                <div class="container">
                    <div class="main-row">
                        <div class="time">${this._formatTime(e)}</div>
                        <div class="value">${this._formatValue(t)}</div>
                        <div class="trend">${d[s]?.symbol||d.unknown.symbol}</div>
                        <div class="delta">${this._calculateDelta()}</div>
                    </div>
                    ${a&&n?i`
                        <div class="prediction">${n}</div>
                    `:""}
                </div>
            </div>
        `}setConfig(t){if(console.info("%c SUGARTV-CARD %c 0.6.2","color: white; background: red; font-weight: 700;","color: red; background: white; font-weight: 700;"),!t.glucose_value)throw new Error("You need to define glucose_value in your configuration.");if(!t.glucose_trend)throw new Error("You need to define glucose_trend in your configuration.");this._config=t,this._data=this._data||this._getInitialDataState()}getCardSize(){return 1}static get styles(){return s}}),window.customCards=window.customCards||[],window.customCards.push({type:"sugartv-card",name:"SugarTV Card",description:"A custom lovelace card for Home Assistant that provides a better way to display Dexcom data."});

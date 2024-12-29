import { css } from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

export const cardStyles = css`
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
        align-items: center;
        justify-content: center;
        line-height: 1;
        padding: 5cqi;
        box-sizing: border-box;
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
`; 
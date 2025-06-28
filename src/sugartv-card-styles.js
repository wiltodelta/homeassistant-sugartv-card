import { css } from 'lit';

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
`;

export const editorStyles = css`
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
`; 
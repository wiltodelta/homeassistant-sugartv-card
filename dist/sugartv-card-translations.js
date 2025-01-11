export const translations = {
    en: {
        editor: {
            glucose_value_label: "Glucose value (required)",
            glucose_trend_label: "Glucose trend (required)",
            show_prediction_label: "Show prediction"
        },
        defaults: {
            value: "N/A",
            delta: "⧖",
            time: "00:00"
        },
        units: {
            mgdl: "mg/dL",
            mmol: "mmol/L"
        },
        trends: {
            rising_quickly: {
                symbol: '↑↑',
                mgdl: {
                    description: "Glucose rising rapidly over 3 mg/dL in 1 minute",
                    prediction: "Expected to rise over 45 mg/dL in 15 minutes"
                },
                mmol: {
                    description: "Glucose rising rapidly over 0.17 mmol/L in 1 minute",
                    prediction: "Expected to rise over 2.5 mmol/L in 15 minutes"
                }
            },
            rising: {
                symbol: '↑',
                mgdl: {
                    description: "Glucose rising 2-3 mg/dL in 1 minute",
                    prediction: "Expected to rise 30-45 mg/dL in 15 minutes"
                },
                mmol: {
                    description: "Glucose rising 0.11-0.17 mmol/L in 1 minute",
                    prediction: "Expected to rise 1.7-2.5 mmol/L in 15 minutes"
                }
            },
            rising_slightly: {
                symbol: '↗',
                mgdl: {
                    description: "Glucose rising 1-2 mg/dL in 1 minute",
                    prediction: "Expected to rise 15-30 mg/dL in 15 minutes"
                },
                mmol: {
                    description: "Glucose rising 0.06-0.11 mmol/L in 1 minute",
                    prediction: "Expected to rise 0.8-1.7 mmol/L in 15 minutes"
                }
            },
            steady: {
                symbol: '→',
                mgdl: {
                    description: "Glucose steady at 1 mg/dL in 1 minute or less",
                    prediction: "Expected change of 15 mg/dL or less in 15 minutes"
                },
                mmol: {
                    description: "Glucose steady at 0.06 mmol/L in 1 minute or less",
                    prediction: "Expected change of 0.8 mmol/L or less in 15 minutes"
                }
            },
            falling_slightly: {
                symbol: '↘',
                mgdl: {
                    description: "Glucose falling 1-2 mg/dL in 1 minute",
                    prediction: "Expected to fall 15-30 mg/dL in 15 minutes"
                },
                mmol: {
                    description: "Glucose falling 0.06-0.11 mmol/L in 1 minute",
                    prediction: "Expected to fall 0.8-1.7 mmol/L in 15 minutes"
                }
            },
            falling: {
                symbol: '↓',
                mgdl: {
                    description: "Glucose falling 2-3 mg/dL in 1 minute",
                    prediction: "Expected to fall 30-45 mg/dL in 15 minutes"
                },
                mmol: {
                    description: "Glucose falling 0.11-0.17 mmol/L in 1 minute",
                    prediction: "Expected to fall 1.7-2.5 mmol/L in 15 minutes"
                }
            },
            falling_quickly: {
                symbol: '↓↓',
                mgdl: {
                    description: "Glucose falling rapidly over 3 mg/dL in 1 minute",
                    prediction: "Expected to fall over 45 mg/dL in 15 minutes"
                },
                mmol: {
                    description: "Glucose falling rapidly over 0.17 mmol/L in 1 minute",
                    prediction: "Expected to fall over 2.5 mmol/L in 15 minutes"
                }
            },
            unknown: {
                symbol: '↻',
                description: "Glucose trend information unavailable",
                prediction: "Unable to predict glucose changes"
            }
        }
    },
    ru: {
        editor: {
            glucose_value_label: "Значение глюкозы (обязательно)",
            glucose_trend_label: "Тренд глюкозы (обязательно)",
            show_prediction_label: "Показывать прогноз"
        },
        defaults: {
            value: "Н/Д",
            delta: "⧖",
            time: "00:00"
        },
        units: {
            mgdl: "мг/дл",
            mmol: "ммоль/л"
        },
        trends: {
            rising_quickly: {
                symbol: '↑↑',
                mgdl: {
                    description: "Глюкоза быстро растет более 3 мг/дл за 1 минуту",
                    prediction: "Ожидается рост более 45 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза быстро растет более 0,17 ммоль/л за 1 минуту",
                    prediction: "Ожидается рост более 2,5 ммоль/л за 15 минут"
                }
            },
            rising: {
                symbol: '↑',
                mgdl: {
                    description: "Глюкоза растет на 2-3 мг/дл за 1 минуту",
                    prediction: "Ожидается рост на 30-45 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза растет на 0,11-0,17 ммоль/л за 1 минуту",
                    prediction: "Ожидается рост на 1,7-2,5 ммоль/л за 15 минут"
                }
            },
            rising_slightly: {
                symbol: '↗',
                mgdl: {
                    description: "Глюкоза медленно растет на 1-2 мг/дл за 1 минуту",
                    prediction: "Ожидается рост на 15-30 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза медленно растет на 0,06-0,11 ммоль/л за 1 минуту",
                    prediction: "Ожидается рост на 0,8-1,7 ммоль/л за 15 минут"
                }
            },
            steady: {
                symbol: '→',
                mgdl: {
                    description: "Глюкоза стабильна в пределах 1 мг/дл за 1 минуту",
                    prediction: "Ожидается изменение не более 15 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза стабильна в пределах 0,06 ммоль/л за 1 минуту",
                    prediction: "Ожидается изменение не более 0,8 ммоль/л за 15 минут"
                }
            },
            falling_slightly: {
                symbol: '↘',
                mgdl: {
                    description: "Глюкоза медленно падает на 1-2 мг/дл за 1 минуту",
                    prediction: "Ожидается падение на 15-30 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза медленно падает на 0,06-0,11 ммоль/л за 1 минуту",
                    prediction: "Ожидается падение на 0,8-1,7 ммоль/л за 15 минут"
                }
            },
            falling: {
                symbol: '↓',
                mgdl: {
                    description: "Глюкоза падает на 2-3 мг/дл за 1 минуту",
                    prediction: "Ожидается падение на 30-45 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза падает на 0,11-0,17 ммоль/л за 1 минуту",
                    prediction: "Ожидается падение на 1,7-2,5 ммоль/л за 15 минут"
                }
            },
            falling_quickly: {
                symbol: '↓↓',
                mgdl: {
                    description: "Глюкоза быстро падает на более 3 мг/дл за 1 минуту",
                    prediction: "Ожидается падение на более 45 мг/дл за 15 минут"
                },
                mmol: {
                    description: "Глюкоза быстро падает на более 0,17 ммоль/л за 1 минуту",
                    prediction: "Ожидается падение на более 2,5 ммоль/л за 15 минут"
                }
            },
            unknown: {
                symbol: '↻',
                description: "Информация о тренде глюкозы недоступна",
                prediction: "Невозможно предсказать изменения глюкозы"
            }
        }
    }
}; 
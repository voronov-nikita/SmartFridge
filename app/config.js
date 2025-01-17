// 
// Файл констант приложения
// Удобно, особенно когда не помнишь везде ли поменял значение переменной 👍
// 

// URL сервера
export const URL = 'http://192.168.0.16:8000'

// работа с диаграммой (цветовая палитра)
export const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientTo: '#08130D',
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

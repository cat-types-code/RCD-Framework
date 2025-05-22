// test_eye.js - Проверка работы глаза
const markdownEye = require('./markdown_eye');
const brain = require('../brain');

// Генерируем тестовую структуру с помощью Brain
const testMarkdownPath = 'test-complex.md';
brain.generateRandomMarkdown(testMarkdownPath, {
    maxDepth: 3,
    totalNodes: 10,
    maxChildren: 3
});

console.log(`🧠 Brain создал тестовую структуру: ${testMarkdownPath}`);

// Тестируем глаз в тестовом режиме
const structure = markdownEye.sight(testMarkdownPath, { testMode: true });

if (structure) {
    // Визуализируем то, что увидел глаз
    markdownEye.visualize(structure, { showContent: true });

    // Экспортируем структуру для дальнейшего анализа
    markdownEye.exportToJson(structure, 'eye-vision.json');

    console.log('✅ Тест глаза завершен успешно!');
} else {
    console.error('❌ Тест глаза не удался!');
}
// Пример использования Brain для генерации тестового Markdown
const brain = require('./brain');

// Генерируем случайную структуру средней сложности
brain.generateRandomMarkdown('test-medium.md', {
    maxDepth: 4,
    totalNodes: 15,
    maxChildren: 3
});

// Генерируем очень простую структуру
brain.generateRandomMarkdown('test-simple.md', {
    maxDepth: 2,
    totalNodes: 5,
    maxChildren: 2
});

// Генерируем сложную структуру
brain.generateRandomMarkdown('test-complex.md', {
    maxDepth: 8,
    totalNodes: 50,
    maxChildren: 5
});
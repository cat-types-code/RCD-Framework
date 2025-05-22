// test_spider.js - Полный цикл тестирования паука
const fs = require('fs');
const path = require('path');
const brain = require('./brain');
const markdownEye = require('./eyes/markdown_eye');
const leg1Builder = require('./legs/leg1_builder');

// Создаем директорию для тестовых файлов
const TEST_DIR = path.join(__dirname, 'test-spider');
if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

// Директория для MD файлов
const MD_DIR = path.join(TEST_DIR, 'markdown');
if (!fs.existsSync(MD_DIR)) {
    fs.mkdirSync(MD_DIR, { recursive: true });
}

// Директория для создания структуры
const TARGET_DIR = path.join(TEST_DIR, 'structure');
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 1. Brain генерирует несколько MD файлов
console.log('🧠 BRAIN: Генерация тестовых MD файлов...');
const mdFiles = [];

// Генерируем простую структуру
const simpleMarkdownPath = path.join(MD_DIR, 'simple-structure.md');
brain.generateRandomMarkdown(simpleMarkdownPath, {
    maxDepth: 2,
    totalNodes: 5,
    maxChildren: 2
});
mdFiles.push(simpleMarkdownPath);

// Генерируем среднюю структуру
const mediumMarkdownPath = path.join(MD_DIR, 'medium-structure.md');
brain.generateRandomMarkdown(mediumMarkdownPath, {
    maxDepth: 4,
    totalNodes: 10,
    maxChildren: 3
});
mdFiles.push(mediumMarkdownPath);

// Генерируем сложную структуру
const complexMarkdownPath = path.join(MD_DIR, 'complex-structure.md');
brain.generateRandomMarkdown(complexMarkdownPath, {
    maxDepth: 5,
    totalNodes: 15,
    maxChildren: 3
});
mdFiles.push(complexMarkdownPath);

console.log(`🧠 BRAIN: Создано ${mdFiles.length} MD файлов`);

// 2. Создаем "sight" - список MD файлов для паука
const sightPath = path.join(TEST_DIR, 'sight.json');
const sight = {
    markdownFiles: mdFiles,
    targetDirectory: TARGET_DIR
};

fs.writeFileSync(sightPath, JSON.stringify(sight, null, 2), 'utf8');
console.log(`👁️ Создан sight.json с ${mdFiles.length} файлами`);

// 3. Паук обрабатывает каждый MD файл из sight
console.log('\n🕸️ SPIDER: Начинаем обработку...');

// Читаем sight.json
const sightData = JSON.parse(fs.readFileSync(sightPath, 'utf8'));

// Обрабатываем каждый MD файл
sightData.markdownFiles.forEach((mdFile, index) => {
    console.log(`\n👁️ Обработка файла ${index + 1}/${sightData.markdownFiles.length}: ${path.basename(mdFile)}`);

    // Глаз смотрит на MD файл
    const structure = markdownEye.sight(mdFile, { testMode: true });

    if (!structure) {
        console.error(`❌ Не удалось проанализировать файл: ${mdFile}`);
        return;
    }

    // Визуализируем структуру (опционально, для отладки)
    // markdownEye.visualize(structure);

    // Определяем директорию для создания этой структуры
    const structureDir = path.join(sightData.targetDirectory, `structure-${index + 1}`);

    // Нога создает реальную структуру каталогов и файлов
    const result = leg1Builder.buildStructure(structure, structureDir);

    console.log(`✅ Структура из ${mdFile} создана в ${structureDir}`);
});

console.log('\n🎉 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!');
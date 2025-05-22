// spider/
// ├── eyes/markdown_eye.js - Глаз для восприятия Markdown
// ├── legs/leg1_builder.js - Нога для создания структуры
// ├── brain.js - Для генерации тестовых Markdown файлов
// └── test_spider.js - Тестовый скрипт для полного цикла

// legs/leg1_builder.js - Нога для создания структуры каталогов и файлов
const fs = require('fs');
const path = require('path');

/**
 * Создает структуру каталогов и файлов на основе структуры, увиденной глазом
 * @param {Object} structure - Структура, полученная от глаза
 * @param {string} targetDir - Корневой каталог, где создавать структуру
 * @param {Object} options - Дополнительные опции
 * @returns {Object} Результат создания (количество созданных каталогов и файлов)
 */
function buildStructure(structure, targetDir, options = {}) {
    console.log(`🦵 Leg1_Builder начинает создание структуры в: ${targetDir}`);

    // Результаты создания
    const result = {
        directories: 0,
        files: 0,
        errors: 0,
        skipped: 0
    };

    // Создаем корневой каталог, если его нет
    if (!fs.existsSync(targetDir)) {
        try {
            fs.mkdirSync(targetDir, { recursive: true });
            result.directories++;
            console.log(`📁 Создан корневой каталог: ${targetDir}`);
        } catch (error) {
            console.error(`❌ Ошибка создания корневого каталога: ${error.message}`);
            result.errors++;
            return result;
        }
    }

    // Рекурсивная функция для создания структуры
    function createNode(node, currentPath) {
        // Если это директория, создаем её и рекурсивно обрабатываем дочерние элементы
        if (node.type === 'directory' && node.name !== 'root') {
            const dirPath = path.join(currentPath, node.name);

            // Пропускаем создание, если директория уже существует
            if (fs.existsSync(dirPath)) {
                console.log(`📁 Пропуск существующего каталога: ${dirPath}`);
                result.skipped++;
            } else {
                try {
                    fs.mkdirSync(dirPath, { recursive: true });
                    result.directories++;
                    console.log(`📁 Создан каталог: ${dirPath}`);
                } catch (error) {
                    console.error(`❌ Ошибка создания каталога ${dirPath}: ${error.message}`);
                    result.errors++;
                    return;
                }
            }

            // Создаем файлы в этой директории
            if (node.files && node.files.length > 0) {
                node.files.forEach(file => {
                    const filePath = path.join(dirPath, file.name);

                    // Пропускаем создание, если файл уже существует
                    if (fs.existsSync(filePath)) {
                        console.log(`📄 Пропуск существующего файла: ${filePath}`);
                        result.skipped++;
                    } else {
                        try {
                            fs.writeFileSync(filePath, file.content || '');
                            result.files++;
                            console.log(`📄 Создан файл: ${filePath}`);
                        } catch (error) {
                            console.error(`❌ Ошибка создания файла ${filePath}: ${error.message}`);
                            result.errors++;
                        }
                    }
                });
            }

            // Рекурсивно обрабатываем дочерние директории
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    createNode(child, dirPath);
                });
            }
        }
        // Если это корневой узел, просто обрабатываем его содержимое
        else if (node.type === 'root') {
            // Создаем файлы в корневом каталоге
            if (node.files && node.files.length > 0) {
                node.files.forEach(file => {
                    const filePath = path.join(currentPath, file.name);

                    // Пропускаем создание, если файл уже существует
                    if (fs.existsSync(filePath)) {
                        console.log(`📄 Пропуск существующего файла: ${filePath}`);
                        result.skipped++;
                    } else {
                        try {
                            fs.writeFileSync(filePath, file.content || '');
                            result.files++;
                            console.log(`📄 Создан файл: ${filePath}`);
                        } catch (error) {
                            console.error(`❌ Ошибка создания файла ${filePath}: ${error.message}`);
                            result.errors++;
                        }
                    }
                });
            }

            // Рекурсивно обрабатываем дочерние директории
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    createNode(child, currentPath);
                });
            }
        }
    }

    // Начинаем с корневого узла
    createNode(structure, targetDir);

    console.log(`🦵 Leg1_Builder завершил создание структуры:`);
    console.log(`   📁 Создано каталогов: ${result.directories}`);
    console.log(`   📄 Создано файлов: ${result.files}`);
    console.log(`   ⏭️ Пропущено существующих: ${result.skipped}`);
    console.log(`   ❌ Ошибок: ${result.errors}`);

    return result;
}

module.exports = { buildStructure };
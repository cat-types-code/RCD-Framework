// markdown_eye.js - Глаз паука для восприятия Markdown
const fs = require('fs');
const path = require('path');

/**
 * Основная функция восприятия - смотрит на Markdown и преобразует его в структуру
 * @param {string} sightPath - Путь к Markdown файлу для анализа
 * @param {Object} options - Дополнительные опции (режим тестирования и т.д.)
 * @returns {Object} Структура, которую увидел глаз
 */
function sight(sightPath, options = {}) {
    // Проверка существования файла
    if (!fs.existsSync(sightPath)) {
        console.error(`👁️ Глаз не может найти файл: ${sightPath}`);
        return null;
    }

    try {
        console.log(`👁️ Глаз смотрит на: ${sightPath}`);

        // Чтение содержимого файла
        const content = fs.readFileSync(sightPath, 'utf8');

        // Парсинг содержимого в структуру
        const structure = perceive(content);

        // В тестовом режиме просто возвращаем структуру без создания файлов
        if (options.testMode) {
            return structure;
        }

        // В будущем здесь будет интеграция с ногами для создания структуры
        console.log(`👁️ Глаз увидел структуру, но ещё не умеет её создавать`);

        return structure;
    } catch (error) {
        console.error(`👁️ Ошибка при взгляде: ${error.message}`);
        return null;
    }
}

/**
 * Восприятие Markdown - преобразует текст в структуру
 * @param {string} content - Содержимое Markdown файла
 * @returns {Object} Структура, представляющая иерархию каталогов и файлов
 */
function perceive(content) {
    // Разбиваем содержимое на строки
    const lines = content.split('\n');

    // Корневая структура
    const root = {
        type: 'root',
        name: 'root',
        path: '',
        children: [],
        files: [],
        metadata: { description: '' }
    };

    // Стек контекста для отслеживания вложенности
    const contextStack = [root];
    let currentContext = root;

    // Флаги для отслеживания состояния парсинга
    let currentFile = null;
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLanguage = '';
    let metadataBuffer = '';

    // Обрабатываем каждую строку
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Проверяем, находимся ли мы в блоке кода
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // Конец блока кода
                inCodeBlock = false;

                // Привязываем содержимое блока к файлу, если он был определен
                if (currentFile) {
                    currentFile.content = codeBlockContent;
                    currentFile.language = codeBlockLanguage;
                    currentFile = null;
                }

                codeBlockContent = '';
                codeBlockLanguage = '';
            } else {
                // Начало блока кода
                inCodeBlock = true;
                codeBlockContent = '';

                // Извлекаем язык из открывающего блока
                const langMatch = line.trim().match(/```(\w*)/);
                codeBlockLanguage = langMatch && langMatch[1] ? langMatch[1] : '';

                continue; // Пропускаем строку открывающего блока
            }
            continue;
        }

        if (inCodeBlock) {
            // Собираем содержимое блока кода
            codeBlockContent += line + '\n';
            continue;
        }

        // Распознаем заголовки (директории)
        const headingMatch = line.match(/^(#+)\s+(.+)$/);
        if (headingMatch) {
            // Очищаем метаданные перед новым заголовком
            if (metadataBuffer.trim()) {
                currentContext.metadata.description = metadataBuffer.trim();
                metadataBuffer = '';
            }

            const level = headingMatch[1].length;
            const title = headingMatch[2].trim();

            // Извлекаем имя каталога
            let dirName = title;
            const prefixMatch = title.match(/^\[([^\]]+)\]\s+(.+)$/);

            if (prefixMatch) {
                const prefix = prefixMatch[1];
                let name = prefixMatch[2].trim();
                name = name.replace(/\s+/g, '_');
                dirName = `${prefix}_${name}`;
            } else {
                dirName = title.replace(/\s+/g, '_');
            }

            // Определяем правильный уровень в иерархии
            while (contextStack.length > level) {
                contextStack.pop();
            }

            // Если нужен более глубокий уровень, добавляем промежуточные
            while (contextStack.length < level) {
                const parent = contextStack[contextStack.length - 1];
                const intermediateNode = {
                    type: 'directory',
                    name: `_level_${contextStack.length + 1}`,
                    children: [],
                    files: [],
                    metadata: { description: '' }
                };
                parent.children.push(intermediateNode);
                contextStack.push(intermediateNode);
            }

            // Создаем узел для нового каталога
            const directoryNode = {
                type: 'directory',
                name: dirName,
                title: title,
                level: level,
                children: [],
                files: [],
                metadata: { description: '' }
            };

            // Добавляем к родителю и обновляем контекст
            const parent = contextStack[contextStack.length - 1];
            parent.children.push(directoryNode);
            contextStack[level] = directoryNode;
            currentContext = directoryNode;

            continue;
        }

        // Распознаем элементы списка (файлы)
        const fileMatch = line.match(/^\s*-\s+`([^`]+)`\s*:?\s*(.*)$/);
        if (fileMatch) {
            const fileName = fileMatch[1].trim();
            const description = fileMatch[2].trim();

            // Создаем структуру для файла
            currentFile = {
                type: 'file',
                name: fileName,
                content: '',
                language: '',
                metadata: { description: description }
            };

            // Добавляем файл к текущему каталогу
            currentContext.files.push(currentFile);

            continue;
        }

        // Собираем текст как метаданные текущего контекста
        if (line.trim()) {
            metadataBuffer += line + '\n';
        }
    }

    // Добавляем последние метаданные, если они есть
    if (metadataBuffer.trim()) {
        currentContext.metadata.description = metadataBuffer.trim();
    }

    return root;
}

/**
 * Визуализирует структуру, которую увидел глаз (для отладки)
 * @param {Object} structure - Структура, полученная от глаза
 * @param {Object} options - Опции вывода (отступы, уровень детализации и т.д.)
 */
function visualize(structure, options = {}) {
    const indent = options.indent || 2;
    const level = options.level || 0;

    // Простой вывод в консоль для отладки
    console.log('👁️ СТРУКТУРА, УВИДЕННАЯ ГЛАЗОМ:');
    console.log('=================================');

    function printNode(node, depth = 0) {
        const indentation = ' '.repeat(depth * indent);

        if (node.type === 'root') {
            console.log(`${indentation}📁 ROOT`);
        } else if (node.type === 'directory') {
            console.log(`${indentation}📁 ${node.title || node.name}`);

            if (node.metadata && node.metadata.description) {
                console.log(`${indentation}  📝 ${node.metadata.description.split('\n')[0].slice(0, 50)}...`);
            }
        }

        // Выводим файлы
        if (node.files && node.files.length > 0) {
            node.files.forEach(file => {
                let icon = '📄';

                // Разные иконки для разных типов файлов
                if (file.name.endsWith('.css')) icon = '🎨';
                else if (file.name.endsWith('.js')) icon = '📜';
                else if (file.name.endsWith('.md')) icon = '📝';

                console.log(`${indentation}  ${icon} ${file.name}`);

                if (options.showContent && file.content) {
                    const contentPreview = file.content.split('\n')[0].slice(0, 30);
                    console.log(`${indentation}    "${contentPreview}..."`);
                }
            });
        }

        // Рекурсивно выводим дочерние узлы
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                printNode(child, depth + 1);
            });
        }
    }

    // Начинаем с корневого узла
    printNode(structure);
    console.log('=================================');
}

/**
 * Экспортирует структуру в JSON файл для дальнейшего анализа
 * @param {Object} structure - Структура для экспорта
 * @param {string} outputPath - Путь для сохранения JSON
 */
function exportToJson(structure, outputPath) {
    try {
        const json = JSON.stringify(structure, null, 2);
        fs.writeFileSync(outputPath, json, 'utf8');
        console.log(`👁️ Структура экспортирована в: ${outputPath}`);
    } catch (error) {
        console.error(`👁️ Ошибка при экспорте структуры: ${error.message}`);
    }
}

// Экспортируем функции
module.exports = {
    sight,
    perceive,
    visualize,
    exportToJson
};
// fly_brain.js - Мозг мухи (логика парсинга)
const fs = require('fs');
const path = require('path');

/**
 * Класс "Мозг" - основная логика мухи
 */
class Brain {
    /**
     * Парсит ASCII-структуру и возвращает список путей
     * @param {string} asciiTree - ASCII-дерево
     * @returns {Array} - Список путей
     */
    parseTree(asciiTree) {
        console.log('🧠 Анализирую структуру проекта...');

        // Список всех путей, которые нужно создать
        const paths = [];

        // Преобразуем структуру в дерево
        const tree = this.buildTree(asciiTree);

        // Преобразуем дерево в плоский список путей
        this.treeToPathList(tree, '', paths);

        return paths;
    }

    /**
     * Строит древовидную структуру из ASCII-представления
     * @param {string} asciiTree - ASCII-дерево
     * @returns {Object} - Корень дерева с вложенными узлами
     */
    buildTree(asciiTree) {
        // Корень дерева
        const root = { name: '', children: [], isDirectory: true };

        // Текущий стек узлов по уровням вложенности
        const nodeStack = [root];

        // Последний уровень вложенности
        let lastIndentLevel = -1;

        // Разбиваем дерево на строки и обрабатываем каждую
        const lines = asciiTree.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimRight();

            // Пропускаем пустые строки и строки-комментарии
            if (!line.trim() || line.trim().startsWith('#')) {
                continue;
            }

            // Ищем комментарий в строке и игнорируем его часть
            const commentIndex = line.indexOf('#');
            const processLine = commentIndex !== -1 ? line.substring(0, commentIndex).trimRight() : line;

            // Пропускаем, если строка стала пустой после удаления комментария
            if (!processLine.trim()) {
                continue;
            }

            // Определяем отступ и глубину
            // Считаем символы отступа (пробелы и табы) до первого непробельного символа
            const match = processLine.match(/^[\s│├└─]*/);
            const indent = match ? match[0] : '';

            // Определяем глубину по символам структуры и отступам
            // Анализируем каждый символ, чтобы определить реальную глубину
            let indentLevel = 0;
            let consecutiveSpaces = 0;

            for (let j = 0; j < indent.length; j++) {
                const char = indent[j];

                if (char === ' ' || char === '\t') {
                    consecutiveSpaces++;
                    // Каждые 2 (или 3 или 4) пробела считаем за один уровень отступа
                    // Адаптируем под конкретный формат
                    if (consecutiveSpaces >= 2) {
                        indentLevel++;
                        consecutiveSpaces = 0;
                    }
                } else if (char === '│' || char === '├' || char === '└' || char === '-' || char === '|') {
                    // Символы структуры увеличивают уровень вложенности
                    if (char === '│' || char === '|') {
                        // Вертикальная линия обычно означает уровень вложенности
                        indentLevel = Math.max(indentLevel, 1);
                    } else if (char === '├' || char === '└') {
                        // Эти символы уже говорят о наличии следующего уровня
                        indentLevel++;
                    }

                    // Сбрасываем счетчик пробелов
                    consecutiveSpaces = 0;
                }
            }

            // Очищаем имя от символов структуры
            const name = processLine.replace(/^[\s│├└─]*/, '').trim();

            // Пропускаем, если имя пустое
            if (!name) {
                continue;
            }

            // Определяем, это файл или каталог
            // Каталоги обычно не имеют расширения или заканчиваются на /
            const isDirectory = !name.includes('.') || name.endsWith('/');

            // Создаем новый узел
            const node = {
                name: name.endsWith('/') ? name.slice(0, -1) : name,
                children: [],
                isDirectory: isDirectory
            };

            // Корректируем стек узлов в зависимости от уровня вложенности
            if (indentLevel > lastIndentLevel) {
                // Вложенность увеличилась - используем последний узел на стеке как родителя
                nodeStack[nodeStack.length - 1].children.push(node);
                nodeStack.push(node);
            } else if (indentLevel === lastIndentLevel) {
                // Вложенность не изменилась - используем предыдущего родителя
                nodeStack.pop(); // Удаляем последний узел
                nodeStack[nodeStack.length - 1].children.push(node);
                nodeStack.push(node);
            } else {
                // Вложенность уменьшилась - поднимаемся по стеку
                while (nodeStack.length > indentLevel + 1) {
                    nodeStack.pop();
                }
                nodeStack[nodeStack.length - 1].children.push(node);
                nodeStack.push(node);
            }

            lastIndentLevel = indentLevel;
        }

        return root;
    }

    /**
     * Преобразует древовидную структуру в плоский список путей
     * @param {Object} node - Текущий узел дерева
     * @param {string} currentPath - Текущий путь
     * @param {Array} paths - Список путей (результат)
     */
    treeToPathList(node, currentPath, paths) {
        // Формируем путь для текущего узла
        const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;

        // Добавляем узел в список, если у него есть имя
        if (node.name) {
            paths.push({
                path: nodePath,
                isDirectory: node.isDirectory
            });
        }

        // Рекурсивно обрабатываем дочерние узлы
        for (const child of node.children) {
            this.treeToPathList(child, nodePath, paths);
        }
    }

    /**
     * Создает файловую структуру на основе списка путей
     * @param {Array} paths - Список путей
     * @param {string} baseDir - Базовый каталог
     */
    createStructure(paths, baseDir) {
        console.log('📂 Создаю структуру проекта...');
        console.log(`Найдено ${paths.length} путей для создания:`);

        // Сначала создаем все каталоги
        for (const item of paths) {
            if (item.isDirectory) {
                const dirPath = path.join(baseDir, item.path);
                try {
                    fs.mkdirSync(dirPath, { recursive: true });
                    console.log(`  📁 ${dirPath}`);
                } catch (error) {
                    console.error(`  ❌ Ошибка при создании каталога: ${error.message}`);
                }
            }
        }

        // Затем создаем файлы
        for (const item of paths) {
            if (!item.isDirectory) {
                const filePath = path.join(baseDir, item.path);
                try {
                    // Создаем родительский каталог, если нужно
                    const dirPath = path.dirname(filePath);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                    }

                    fs.writeFileSync(filePath, '');
                    console.log(`  📄 ${filePath}`);
                } catch (error) {
                    console.error(`  ❌ Ошибка при создании файла: ${error.message}`);
                }
            }
        }
    }

    /**
     * Отладочный метод для вывода древовидной структуры
     * @param {Object} node - Узел дерева
     * @param {number} level - Уровень вложенности
     */
    debugPrintTree(node, level = 0) {
        const indent = '  '.repeat(level);
        if (node.name) {
            console.log(`${indent}${node.isDirectory ? '📁' : '📄'} ${node.name}`);
        }
        for (const child of node.children) {
            this.debugPrintTree(child, level + 1);
        }
    }
}

module.exports = Brain;
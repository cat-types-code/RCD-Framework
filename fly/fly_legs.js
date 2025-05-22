// fly_legs.js - Лапки мухи (вспомогательные функции)
const fs = require('fs');
const path = require('path');

/**
 * Создает README.md для проекта с описанием структуры
 * @param {string} dirPath - Путь к каталогу проекта
 */
function createReadmeOnTheFly(dirPath) {
    console.log(`🦵 Лапка #1: Создает README.md на лету в ${dirPath}...`);

    // Имя проекта - имя каталога
    const projectName = path.basename(dirPath);

    // Содержимое README.md
    const content = `# ${projectName}

## О проекте

Этот проект был создан автоматически с помощью 🪰 Мухи RCD Garden.

## Структура проекта

\`\`\`
${projectName}/
${generateProjectTree(dirPath, dirPath, 1)}
\`\`\`

Создано: ${new Date().toLocaleDateString()}
`;

    // Путь к README.md
    const readmePath = path.join(dirPath, 'README.md');

    // Если README.md еще не существует, создаем его
    if (!fs.existsSync(readmePath)) {
        try {
            fs.writeFileSync(readmePath, content);
            console.log(`  📄 Создан файл: ${readmePath}`);
        } catch (error) {
            console.error(`  ❌ Ошибка при создании README.md: ${error.message}`);
        }
    } else {
        console.log(`  ⏩ README.md уже существует, пропускаю`);
    }
}

/**
 * Генерирует дерево проекта для README.md
 * @param {string} basePath - Базовый путь проекта
 * @param {string} dirPath - Текущий каталог
 * @param {number} level - Уровень вложенности
 * @returns {string} - Текстовое представление дерева
 */
function generateProjectTree(basePath, dirPath, level) {
    let result = '';
    const indent = '│   '.repeat(level);

    try {
        const items = fs.readdirSync(dirPath);

        // Сортируем: сначала каталоги, потом файлы
        const sortedItems = items.sort((a, b) => {
            const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
            const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();

            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

        // Обрабатываем каждый элемент
        for (let i = 0; i < sortedItems.length; i++) {
            const item = sortedItems[i];

            // Пропускаем README.md и скрытые файлы
            if (item === 'README.md' || item.startsWith('.')) continue;

            const itemPath = path.join(dirPath, item);
            const isDirectory = fs.statSync(itemPath).isDirectory();
            const isLast = i === sortedItems.length - 1;
            const prefix = isLast ? '└── ' : '├── ';

            result += `${indent}${prefix}${item}${isDirectory ? '/' : ''}\n`;

            // Если это каталог, рекурсивно обрабатываем его содержимое
            if (isDirectory) {
                result += generateProjectTree(basePath, itemPath, level + 1);
            }
        }
    } catch (error) {
        console.error(`  ❌ Ошибка при генерации дерева: ${error.message}`);
    }

    return result;
}

/**
 * Создает .gitignore для проекта, если его нет
 * @param {string} dirPath - Путь к каталогу проекта
 */
function createGitignore(dirPath) {
    console.log(`🦵 Лапка #2: Создает .gitignore в ${dirPath}...`);

    // Путь к .gitignore
    const gitignorePath = path.join(dirPath, '.gitignore');

    // Если .gitignore еще не существует, создаем его
    if (!fs.existsSync(gitignorePath)) {
        // Стандартное содержимое .gitignore
        const content = `# Зависимости
node_modules/
package-lock.json
yarn.lock

# Файлы среды
.env
.env.local
.env.development
.env.test
.env.production

# Журналы
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Временные файлы
.DS_Store
Thumbs.db
.cache/
.project
.idea/
.vscode/
*.swp
*.swo

# Сборка
dist/
build/
out/
`;

        try {
            fs.writeFileSync(gitignorePath, content);
            console.log(`  📄 Создан файл: ${gitignorePath}`);
        } catch (error) {
            console.error(`  ❌ Ошибка при создании .gitignore: ${error.message}`);
        }
    } else {
        console.log(`  ⏩ .gitignore уже существует, пропускаю`);
    }
}

/**
 * Создает заглушки для файлов по расширениям
 * @param {string} dirPath - Путь к каталогу проекта
 */
function createFileStubs(dirPath) {
    console.log(`🦵 Лапка #3: Создает заглушки для файлов в ${dirPath}...`);

    // Шаблоны содержимого для разных типов файлов
    const templates = {
        // JavaScript файлы
        '.js': '// TODO: Реализовать функциональность\n',

        // HTML файлы
        '.html': '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n',

        // CSS файлы
        '.css': '/* Стили */\n',

        // Markdown файлы (кроме README.md)
        '.md': '# Документация\n\nПишите содержимое здесь.\n',

        // JSON файлы
        '.json': '{\n  "name": "project",\n  "version": "1.0.0"\n}\n',

        // TypeScript файлы
        '.ts': '// TypeScript file\n',

        // React компоненты
        '.jsx': 'import React from "react";\n\nfunction Component() {\n  return <div>Hello World</div>;\n}\n\nexport default Component;\n',
        '.tsx': 'import React from "react";\n\nfunction Component(): JSX.Element {\n  return <div>Hello World</div>;\n}\n\nexport default Component;\n'
    };

    // Рекурсивно обходим файловую структуру
    function processDirectory(currentPath) {
        try {
            const items = fs.readdirSync(currentPath);

            for (const item of items) {
                const itemPath = path.join(currentPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    processDirectory(itemPath);
                } else if (stats.size === 0) { // Только для пустых файлов
                    const ext = path.extname(item);

                    if (templates[ext] && item !== 'README.md') {
                        fs.writeFileSync(itemPath, templates[ext]);
                        console.log(`  ✏️ Добавлено содержимое: ${itemPath}`);
                    }
                }
            }
        } catch (error) {
            console.error(`  ❌ Ошибка при обработке каталога: ${error.message}`);
        }
    }

    processDirectory(dirPath);
}

module.exports = {
    leg1: createReadmeOnTheFly,   // Создает README.md с описанием структуры
    leg2: createGitignore,        // Создает базовый .gitignore
    leg3: createFileStubs         // Создает заглушки для пустых файлов
};
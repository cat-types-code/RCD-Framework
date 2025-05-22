/* === yumiya-cat-midd-constructor.js для entropy (простой подход) === */
const fs = require('fs');
const path = require('path');

// Получаем имя текущего каталога
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`📚 YUMIA-CAT запущен для каталога: ${catalogName}`);

// Функция для чтения meow.json
function readMeow() {
    const meowPath = path.join(currentDir, 'meow.json');

    if (!fs.existsSync(meowPath)) {
        console.error('❌ meow.json не найден!');
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(meowPath, 'utf8'));
    } catch (error) {
        console.error('❌ Ошибка чтения meow.json:', error);
        return null;
    }
}

// Функция для анализа одной крысы
function analyzeRat(ratPath) {
    if (!fs.existsSync(ratPath)) {
        console.warn(`⚠️  Файл не найден: ${ratPath}`);
        return null;
    }

    const content = fs.readFileSync(ratPath, 'utf8');
    const fileName = path.basename(ratPath);

    // Извлекаем модули
    const moduleRegex = /\/\*\s*===\s*НАЧАЛО МОДУЛЯ:\s*(.+?)\s*===\s*\*\/([\s\S]*?)\/\*\s*===\s*КОНЕЦ МОДУЛЯ:\s*(.+?)\s*===\s*\*\//g;
    const modules = [];
    let match;

    while ((match = moduleRegex.exec(content)) !== null) {
        const moduleName = match[1];
        const moduleContent = match[2];

        modules.push({
            name: moduleName,
            content: moduleContent.trim(),
            dependencies: extractDependencies(moduleContent),
            performance: analyzePerformance(moduleContent),
            description: extractDescription(moduleContent),
            fileName: fileName
        });
    }

    // Если нет модулей, создаем один общий модуль
    if (modules.length === 0) {
        modules.push({
            name: fileName.replace('.css', '').replace('rat_', ''),
            content: content,
            dependencies: extractDependencies(content),
            performance: analyzePerformance(content),
            description: extractDescription(content),
            fileName: fileName
        });
    }

    return modules;
}

// Извлекает зависимости (CSS переменные)
function extractDependencies(content) {
    const varRegex = /var\((--[\w-]+)\)/g;
    const dependencies = new Set();
    let match;

    while ((match = varRegex.exec(content)) !== null) {
        dependencies.add(match[1]);
    }

    return Array.from(dependencies);
}

// Анализирует производительность
function analyzePerformance(content) {
    const heavyProps = {
        'box-shadow': 'Тяжелое',
        'filter': 'Тяжелое',
        'backdrop-filter': 'Тяжелое',
        'transform': 'Среднее',
        'animation': 'Среднее',
        'transition': 'Легкое'
    };

    let impact = 'Минимальное';

    for (const [prop, weight] of Object.entries(heavyProps)) {
        if (content.includes(prop)) {
            if (weight === 'Тяжелое') return 'Высокое';
            if (weight === 'Среднее' && impact !== 'Высокое') impact = 'Среднее';
            if (weight === 'Легкое' && impact === 'Минимальное') impact = 'Низкое';
        }
    }

    return impact;
}

// Извлекает описание
function extractDescription(content) {
    // Пытаемся найти описание в первых строках
    const lines = content.trim().split('\n').slice(0, 10);

    for (const line of lines) {
        const cleanLine = line.replace(/\/\*|\*\/|\*|\s+/g, ' ').trim();
        if (cleanLine.length > 10 && cleanLine.length < 100 &&
            !cleanLine.includes('@') && !cleanLine.includes(':') &&
            !cleanLine.includes('===') && !cleanLine.includes('НАЧАЛО')) {
            return cleanLine;
        }
    }

    // Если нет явного описания, анализируем селекторы
    const selectors = [];
    const selectorRegex = /\.([a-zA-Z-]+)/g;
    let match;

    while ((match = selectorRegex.exec(content)) !== null) {
        selectors.push(match[1]);
    }

    if (selectors.length > 0) {
        return `Стилизация для ${selectors.slice(0, 3).join(', ')}${selectors.length > 3 ? '...' : ''}`;
    }

    return 'Основные стили энтропии';
}

// Генерирует Эвтюмию в формате Markdown
function generateYumiyaMarkdown(allModules, meowData) {
    const date = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let content = `# 📚 Эвтюмия: ${catalogName.toUpperCase()}

> "${meowData.metadata.description || 'Хаос дает рождение танцующей звезде'}"  
> *— Автоматически сгенерировано*

## 🗺️ Общий обзор

**Каталог:** ${catalogName}  
**Количество файлов:** ${meowData.rats.length}  
**Количество модулей:** ${allModules.length}  
**Последнее обновление:** ${meowData.metadata.lastUpdate}  
**Дата создания документации:** ${date}  

## 📋 Файлы и модули

`;

    // Для каждого файла в meow
    meowData.rats.forEach((ratFile, index) => {
        const fileModules = allModules.filter(m => m.fileName === ratFile);

        content += `### ${index + 1}. 📄 ${ratFile}\n\n`;

        if (fileModules.length === 0) {
            content += `*Файл не содержит модулей или не найден*\n\n`;
            return;
        }

        fileModules.forEach((module, moduleIndex) => {
            content += `#### ${moduleIndex + 1}. ${module.name}\n\n`;
            content += `**Описание:** ${module.description}\n\n`;

            if (module.dependencies.length > 0) {
                content += `**Используемые переменные:**\n`;
                module.dependencies.forEach(dep => {
                    content += `- \`${dep}\`\n`;
                });
                content += '\n';
            }

            content += `**Производительность:** ${module.performance}\n\n`;

            // Показываем первые строки кода
            const snippet = module.content.split('\n').slice(0, 8).join('\n');
            content += `**Код:**\n\`\`\`css\n${snippet}${module.content.split('\n').length > 8 ? '\n...' : ''}\n\`\`\`\n\n`;

            content += '---\n\n';
        });
    });

    // Добавляем секции
    content += generateQuickNavigation(allModules);
    content += generateStatistics(allModules, meowData);
    content += generateRules();

    content += `\n---\n*Автоматически обновлено: ${date}*\n`;
    content += `*Генератор: YUMIA-CAT v2.0 (через meow.json)*\n`;

    return content;
}

// Быстрая навигация
function generateQuickNavigation(modules) {
    let nav = `## 🎯 Быстрая навигация\n\n`;

    const categoryMap = {
        'Анимация': modules.filter(m => m.content.includes('animation') || m.content.includes('@keyframes')),
        'Эффекты': modules.filter(m => m.content.includes('transform') || m.content.includes('filter')),
        'Цвета': modules.filter(m => m.dependencies.some(d => d.includes('color'))),
        'Производительность': modules.filter(m => m.performance === 'Высокое')
    };

    Object.entries(categoryMap).forEach(([category, categoryModules]) => {
        if (categoryModules.length > 0) {
            nav += `### ${category}\n`;
            categoryModules.forEach(module => {
                nav += `- **${module.fileName}** → ${module.name}\n`;
            });
            nav += '\n';
        }
    });

    return nav;
}

// Статистика
function generateStatistics(modules, meowData) {
    const stats = modules.reduce((acc, m) => {
        acc.performance[m.performance] = (acc.performance[m.performance] || 0) + 1;
        m.dependencies.forEach(dep => acc.variables.add(dep));
        return acc;
    }, {
        performance: {},
        variables: new Set()
    });

    let content = `## 📊 Статистика\n\n`;
    content += `- **Файлов крыс:** ${meowData.rats.length}\n`;
    content += `- **Модулей:** ${modules.length}\n`;
    content += `- **Уникальных переменных:** ${stats.variables.size}\n`;
    content += `- **По производительности:**\n`;

    Object.entries(stats.performance).forEach(([perf, count]) => {
        content += `  - ${perf}: ${count}\n`;
    });

    content += '\n';

    // Топ переменных
    const varCount = new Map();
    modules.forEach(m => {
        m.dependencies.forEach(dep => {
            varCount.set(dep, (varCount.get(dep) || 0) + 1);
        });
    });

    const topVars = Array.from(varCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topVars.length > 0) {
        content += `### Топ-5 переменных\n`;
        topVars.forEach(([varName, count]) => {
            content += `- \`${varName}\` используется ${count} раз\n`;
        });
        content += '\n';
    }

    return content;
}

// Правила работы
function generateRules() {
    return `## 🔥 Правила работы с entropy

1. **Модульность** - каждая крыса отвечает за свою задачу
2. **Производительность** - избегайте тяжелых эффектов
3. **Именование** - файлы начинаются с \`rat_\`
4. **Документация** - описывайте модули в крысах
5. **Переменные** - используйте CSS переменные везде
6. **Порядок** - соблюдайте порядок в meow.json

`;
}

// Главная функция
function generateYumiya() {
    console.log('🚀 Начинаем генерацию Эвтюмии...');

    // Читаем meow.json
    const meowData = readMeow();
    if (!meowData) {
        console.error('❌ Не удалось прочитать meow.json');
        return;
    }

    console.log(`📋 Найдено ${meowData.rats.length} крыс в meow.json`);

    // Анализируем каждую крысу
    const allModules = [];
    meowData.rats.forEach(ratFile => {
        const ratPath = path.join(currentDir, ratFile);
        const modules = analyzeRat(ratPath);

        if (modules) {
            allModules.push(...modules);
            console.log(`✓ Проанализирован ${ratFile}: ${modules.length} модулей`);
        }
    });

    console.log(`📊 Всего найдено ${allModules.length} модулей`);

    // Генерируем Markdown
    const yumiyaContent = generateYumiyaMarkdown(allModules, meowData);

    // Сохраняем файл
    const outputPath = path.join(currentDir, `${catalogName}.md`);

    try {
        fs.writeFileSync(outputPath, yumiyaContent, 'utf8');
        console.log(`✨ Эвтюмия создана: ${outputPath}`);

        // Финальная статистика
        console.log('\n📊 Итог:');
        console.log(`- Файлов: ${meowData.rats.length}`);
        console.log(`- Модулей: ${allModules.length}`);
        console.log(`- Переменных: ${new Set(allModules.flatMap(m => m.dependencies)).size}`);
    } catch (error) {
        console.error('❌ Ошибка при сохранении файла:', error);
    }
}

// Запуск
generateYumiya();
/* === cat-midd-yumiya.js === */
const fs = require('fs');
const path = require('path');

// MIDD кот для сборки Эвтюмии из подкаталогов
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`📚 MIDD CAT-YUMIYA запущен для каталога: ${catalogName}`);

// Читает rawr.json
function readRawr() {
    const rawrPath = path.join(currentDir, 'rawr.json');

    if (!fs.existsSync(rawrPath)) {
        console.error('❌ rawr.json не найден!');
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(rawrPath, 'utf8'));
    } catch (error) {
        console.error('❌ Ошибка чтения rawr.json:', error);
        return null;
    }
}

// Извлекает информацию из документации подкаталога
function analyzeSubDocumentation(docPath) {
    const fullPath = path.join(currentDir, docPath);

    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  Документация не найдена: ${docPath}`);
        return null;
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        // Извлекаем основную информацию
        const title = lines.find(l => l.startsWith('# '))?.replace('# ', '').trim();
        const description = lines.find(l => l.startsWith('> ') && !l.includes('*'))?.replace('> ', '').trim();

        // Извлекаем модули
        const moduleHeaders = lines.filter(l => l.startsWith('## ') && !l.includes('🗺️') && !l.includes('📊'));

        return {
            title,
            description,
            path: docPath,
            catalog: path.dirname(docPath),
            modules: moduleHeaders.map(h => h.replace('## ', '')),
            fullContent: content
        };
    } catch (error) {
        console.error(`❌ Ошибка чтения ${docPath}:`, error);
        return null;
    }
}

// Генерирует MIDD Эвтюмию
function buildMiddYumiya() {
    const rawr = readRawr();
    if (!rawr) return;

    console.log(`📋 Найдено ${rawr.documentations.length} документаций для сборки`);

    const date = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Заголовок
    let doc = `# Эвтюмия: ${catalogName.toUpperCase()} (MIDD)

> "${rawr.metadata.description || 'Сборка высшего порядка'}"  
> *— Автоматически сгенерировано MIDD CAT-YUMIYA*

## 🏗️ Архитектура MIDD уровня

**Каталог:** ${catalogName}  
**Уровень:** MIDD (Средний)  
**Подкаталоги:** ${rawr.constructors.length}  
**Последнее обновление:** ${rawr.metadata.lastUpdate}  
**Дата создания документации:** ${date}  

## 📁 Подкаталоги и их документации

`;

    // Анализируем каждую документацию
    const subDocs = [];
    rawr.documentations.forEach((docPath, index) => {
        const subDoc = analyzeSubDocumentation(docPath);
        if (subDoc) {
            subDocs.push(subDoc);
            console.log(`✓ Проанализирована документация: ${docPath}`);
        }
    });

    // Генерируем секции для каждого подкаталога
    subDocs.forEach((subDoc, index) => {
        doc += `### ${index + 1}. 📂 ${subDoc.catalog}/

**Документация:** [${subDoc.catalog}.md](${subDoc.path})  
**Описание:** ${subDoc.description || 'Без описания'}  
**Модулей:** ${subDoc.modules.length}  

`;

        if (subDoc.modules.length > 0) {
            doc += `**Основные модули:**\n`;
            subDoc.modules.slice(0, 5).forEach(module => {
                doc += `- ${module}\n`;
            });
            if (subDoc.modules.length > 5) {
                doc += `- *и еще ${subDoc.modules.length - 5} модулей...*\n`;
            }
            doc += '\n';
        }
    });

    // Добавляем навигацию
    doc += generateMiddNavigation(subDocs);

    // Добавляем статистику
    doc += generateMiddStatistics(subDocs, rawr);

    // Добавляем правила
    doc += generateMiddRules();

    doc += `\n---\n*Автоматически обновлено: ${date}*\n`;
    doc += `*Генератор: MIDD CAT-YUMIYA v1.0*\n`;

    // Сохраняем документацию
    const outputPath = path.join(currentDir, `${catalogName}.md`);

    try {
        fs.writeFileSync(outputPath, doc);
        console.log(`✨ Эвтюмия MIDD создана: ${outputPath}`);
        console.log(`📊 Проанализировано: ${subDocs.length}/${rawr.documentations.length} документаций`);
    } catch (error) {
        console.error('❌ Ошибка при сохранении файла:', error);
    }
}

// Генерирует навигацию
function generateMiddNavigation(subDocs) {
    let nav = `## 🎯 Быстрая навигация

### По подкаталогам
`;

    subDocs.forEach(subDoc => {
        nav += `- [${subDoc.catalog}/](${subDoc.path}) - ${subDoc.modules.length} модулей\n`;
    });

    // Ищем общие паттерны
    const patterns = {
        'Анимации': subDocs.filter(d => d.modules.some(m => m.toLowerCase().includes('animation'))),
        'Эффекты': subDocs.filter(d => d.modules.some(m => m.toLowerCase().includes('effect'))),
        'Паттерны': subDocs.filter(d => d.modules.some(m => m.toLowerCase().includes('pattern')))
    };

    nav += '\n### По типам модулей\n';
    Object.entries(patterns).forEach(([type, docs]) => {
        if (docs.length > 0) {
            nav += `#### ${type}\n`;
            docs.forEach(doc => {
                nav += `- ${doc.catalog}/ - ${doc.modules.filter(m =>
                    m.toLowerCase().includes(type.toLowerCase().slice(0, -1)))
                    .join(', ')}\n`;
            });
        }
    });

    return nav + '\n';
}

// Генерирует статистику
function generateMiddStatistics(subDocs, rawr) {
    const totalModules = subDocs.reduce((sum, doc) => sum + doc.modules.length, 0);
    const subCatalogs = subDocs.map(doc => doc.catalog);

    let stats = `## 📊 Статистика MIDD

- **Подкаталогов:** ${rawr.constructors.length}
- **Документаций:** ${subDocs.length}
- **Всего модулей:** ${totalModules}
- **Среднее модулей на каталог:** ${Math.round(totalModules / subDocs.length)}

### Распределение модулей
`;

    subDocs.forEach(doc => {
        stats += `- **${doc.catalog}**: ${doc.modules.length} модулей\n`;
    });

    return stats + '\n';
}

// Генерирует правила
function generateMiddRules() {
    return `## 🔥 Правила работы с MIDD уровнем

1. **Структура** - каждый подкаталог должен иметь свой конструктор и документацию
2. **Именование** - cat-midd-* для MIDD котов, dog-midd для MIDD собаки
3. **Порядок** - последовательность в rawr.json определяет порядок сборки
4. **Синхронизация** - MIDD CAT работает с результатами LEAF котов
5. **Документация** - автоматически агрегирует документацию подкаталогов

`;
}

// Запускаем
buildMiddYumiya();
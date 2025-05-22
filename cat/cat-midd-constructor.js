/* === cat-midd-constructor.js === */
const fs = require('fs');
const path = require('path');

// MIDD кот для сборки конструкторов из подкаталогов
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`🐱 MIDD CAT-CONSTRUCTOR запущен для каталога: ${catalogName}`);

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

// Собирает конструкторы из подкаталогов
function buildMiddConstructor() {
    const rawr = readRawr();
    if (!rawr) return;

    console.log(`📋 Найдено ${rawr.constructors.length} конструкторов для сборки`);

    // Заголовок
    let finalCSS = `/*
 * === ${catalogName.toUpperCase()} CONSTRUCTOR ===
 * Собрано автоматически MIDD CAT
 * Уровень: MIDD
 * Каталог: ${catalogName}
 * Дата сборки: ${new Date().toISOString()}
 */\n\n`;

    // Собираем каждый конструктор
    let assembledCount = 0;

    rawr.constructors.forEach((constructorPath, index) => {
        const fullPath = path.join(currentDir, constructorPath);
        const subCatalog = path.dirname(constructorPath);

        if (fs.existsSync(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');

                // Добавляем разделитель
                finalCSS += `/* ===== ${index + 1}. CONSTRUCTOR: ${subCatalog} ===== */\n`;
                finalCSS += content;
                finalCSS += '\n\n';

                assembledCount++;
                console.log(`✓ Добавлен конструктор: ${constructorPath}`);
            } catch (error) {
                console.warn(`⚠️  Ошибка чтения ${constructorPath}:`, error.message);
            }
        } else {
            console.warn(`⚠️  Файл не найден: ${constructorPath}`);
        }
    });

    // Добавляем метаданные в конец файла
    const metadata = [
        '',
        '/* ==========================================',
        ' * МЕТАДАННЫЕ MIDD СБОРКИ',
        ' * ==========================================',
        ` * Каталог: ${catalogName}`,
        ` * Собрано конструкторов: ${assembledCount}/${rawr.constructors.length}`,
        ` * Подкаталоги: ${rawr.constructors.map(p => path.dirname(p)).join(', ')}`,
        ` * Время сборки: ${new Date().toLocaleString('ru-RU')}`,
        ` * Автор: MIDD CAT-CONSTRUCTOR`,
        ' * ========================================== */'
    ];

    finalCSS += metadata.join('\n');

    // Сохраняем результат
    const outputFile = path.join(currentDir, `${catalogName}.css`);

    try {
        fs.writeFileSync(outputFile, finalCSS);
        console.log(`✨ Создан MIDD конструктор: ${catalogName}.css`);
        console.log(`📊 Собрано: ${assembledCount}/${rawr.constructors.length} конструкторов`);
        return true;
    } catch (error) {
        console.error(`❌ Ошибка сохранения ${outputFile}:`, error);
        return false;
    }
}

// Запускаем
buildMiddConstructor();
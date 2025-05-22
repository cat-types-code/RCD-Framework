/* === cat-midd-constructor.js === */
const fs = require('fs');
const path = require('path');

// Получаем имя текущей директории (будет именем CSS файла)
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`🐱 CAT начинает сборку для каталога: ${catalogName}`);

// Читаем meow.json
function readMeow() {
    const meowPath = path.join(currentDir, 'meow.json');

    if (!fs.existsSync(meowPath)) {
        console.error('❌ meow.json не найден!');
        process.exit(1);
    }

    try {
        const meowData = JSON.parse(fs.readFileSync(meowPath, 'utf8'));
        console.log(`📋 Найдено ${meowData.rats.length} крыс в meow.json`);
        return meowData;
    } catch (error) {
        console.error('❌ Ошибка чтения meow.json:', error);
        process.exit(1);
    }
}

// Собираем крыс по порядку из meow.json
function assembleRats(meowData) {
    const assembledCSS = [];

    // Заголовок
    assembledCSS.push(`/*`);
    assembledCSS.push(` * === ${catalogName.toUpperCase()} ===`);
    assembledCSS.push(` * Собрано автоматически RCD CAT`);
    assembledCSS.push(` * Каталог: ${catalogName}`);
    assembledCSS.push(` * Описание: ${meowData.metadata.description}`);
    assembledCSS.push(` * Дата сборки: ${new Date().toISOString()}`);
    assembledCSS.push(` */`);
    assembledCSS.push('');

    // Собираем каждую крысу
    let assembledCount = 0;

    meowData.rats.forEach((ratFile, index) => {
        const ratPath = path.join(currentDir, ratFile);

        if (fs.existsSync(ratPath)) {
            try {
                const ratContent = fs.readFileSync(ratPath, 'utf8');

                // Добавляем разделитель
                assembledCSS.push(`/* ===== НАЧАЛО КРЫСЫ ${index + 1}: ${ratFile} ===== */`);
                assembledCSS.push(ratContent);
                assembledCSS.push(`/* ===== КОНЕЦ КРЫСЫ ${index + 1}: ${ratFile} ===== */`);
                assembledCSS.push('');

                assembledCount++;
                console.log(`✓ Добавлена крыса: ${ratFile}`);
            } catch (error) {
                console.warn(`⚠️  Ошибка чтения ${ratFile}:`, error.message);
            }
        } else {
            console.warn(`⚠️  Файл не найден: ${ratFile}`);
        }
    });

    return {
        content: assembledCSS.join('\n'),
        count: assembledCount
    };
}

// Сохраняем результат
function saveCatalog(content) {
    const outputFile = path.join(currentDir, `${catalogName}.css`);

    try {
        fs.writeFileSync(outputFile, content);
        console.log(`✨ Создан файл: ${catalogName}.css`);
        return true;
    } catch (error) {
        console.error(`❌ Ошибка сохранения ${outputFile}:`, error);
        return false;
    }
}

// Добавляем метаданные в конец файла
function addMetadata(content, ratCount, meowData) {
    const metadata = [
        '',
        '/* ==========================================',
        ' * МЕТАДАННЫЕ СБОРКИ',
        ' * ==========================================',
        ` * Каталог: ${catalogName}`,
        ` * Собрано крыс: ${ratCount}/${meowData.rats.length}`,
        ` * Время сборки: ${new Date().toLocaleString('ru-RU')}`,
        ` * Автор: RCD CAT`,
        ' * ========================================== */'
    ];

    return content + '\n' + metadata.join('\n');
}

// Главная функция
function buildCatalog() {
    console.log('🚀 Начинаем сборку каталога...');

    // Читаем meow.json
    const meowData = readMeow();

    // Проверяем, что имя каталога совпадает с metadata
    if (meowData.metadata.catalog !== catalogName) {
        console.warn(`⚠️  Несоответствие имени каталога в meow.json: ${meowData.metadata.catalog} vs ${catalogName}`);
    }

    // Собираем крыс
    const result = assembleRats(meowData);

    // Добавляем метаданные
    const finalContent = addMetadata(result.content, result.count, meowData);

    // Сохраняем
    const success = saveCatalog(finalContent);

    if (success) {
        console.log('');
        console.log('🎉 Сборка завершена успешно!');
        console.log(`📁 Создан файл: ${catalogName}.css`);
        console.log(`🐀 Собрано крыс: ${result.count}/${meowData.rats.length}`);
    } else {
        console.log('❌ Сборка провалена!');
        process.exit(1);
    }
}

// Запускаем
buildCatalog();

/**
 * === Пример создания структуры ===
 * // Создаем структуру для entropy
 * mkdir entropy
 * cd entropy
 *
 * // Создаем файлы
 * touch meow.json cat-midd-constructor.js
 * touch rat_flux.css rat_drift.css rat_spiral.css rat_turbulence.css rat_storm.css
 *
 * // Запускаем сборку
 * node cat-midd-constructor.js
 */
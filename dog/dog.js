/* === dog.js для entropy (умная версия) === */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Получаем имя текущего каталога
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`🐕 SMART DOG запущен для каталога: ${catalogName}`);

// Находит всех котов в директории
function findCats() {
    const files = fs.readdirSync(currentDir);
    const cats = files.filter(file =>
        file.endsWith('.js') &&
        file.includes('cat') &&
        file !== 'dog.js'
    );

    console.log(`🔍 Найдено котов: ${cats.length} (${cats.join(', ')})`);
    return cats;
}

// Начальная настройка
function initialize() {
    const meowPath = path.join(currentDir, 'meow.json');

    // Если нет meow.json, создаем
    if (!fs.existsSync(meowPath)) {
        const initialMeow = {
            rats: [],
            metadata: {
                catalog: catalogName,
                description: `Auto-generated config for ${catalogName}`,
                lastUpdate: new Date().toISOString()
            }
        };

        fs.writeFileSync(meowPath, JSON.stringify(initialMeow, null, 2));
        console.log('📝 Создан новый meow.json');
    }
}

// Сканирует директорию на наличие крыс
function scanForRats() {
    const files = fs.readdirSync(currentDir);
    const foundRats = files.filter(file =>
        file.startsWith('rat_') &&
        file.endsWith('.css')
    ).sort();

    console.log(`🔍 Найдено крыс: ${foundRats.length}`);
    return foundRats;
}

// Читает текущий meow.json
function readMeow() {
    const meowPath = path.join(currentDir, 'meow.json');
    try {
        return JSON.parse(fs.readFileSync(meowPath, 'utf8'));
    } catch (error) {
        console.error('❌ Ошибка чтения meow.json:', error);
        return null;
    }
}

// Обновляет meow.json с новыми крысами
function updateMeow(foundRats) {
    const meow = readMeow();
    if (!meow) return false;

    const currentRats = new Set(meow.rats);
    const newRats = foundRats.filter(rat => !currentRats.has(rat));
    const removedRats = meow.rats.filter(rat => !foundRats.includes(rat));

    let changed = false;

    if (newRats.length > 0) {
        console.log(`➕ Добавляем новых крыс: ${newRats.join(', ')}`);
        meow.rats = meow.rats.concat(newRats);
        changed = true;
    }

    if (removedRats.length > 0) {
        console.log(`➖ Удаляем отсутствующих крыс: ${removedRats.join(', ')}`);
        meow.rats = meow.rats.filter(rat => foundRats.includes(rat));
        changed = true;
    }

    if (changed) {
        meow.metadata.lastUpdate = new Date().toISOString();
        meow.rats.sort();

        fs.writeFileSync(
            path.join(currentDir, 'meow.json'),
            JSON.stringify(meow, null, 2)
        );

        console.log('✅ meow.json обновлен');
        return true;
    }

    console.log('📋 Изменений не обнаружено');
    return false;
}

// Запускает всех котов
function runAllCats() {
    const cats = findCats();

    if (cats.length === 0) {
        console.log('⚠️  Не найдено ни одного кота!');
        return Promise.resolve();
    }

    console.log('🐱 Запускаем всех котов...');

    // Создаем промисы для всех котов
    const catPromises = cats.map(catFile => {
        return new Promise((resolve, reject) => {
            console.log(`\n🚀 Запуск ${catFile}...`);

            exec(`node ${path.join(currentDir, catFile)}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Ошибка в ${catFile}:`, error.message);
                    resolve({ success: false, catFile, error });
                } else {
                    console.log(`✓ ${catFile} выполнен успешно`);
                    if (stdout) console.log(`   Output: ${stdout.trim()}`);
                    resolve({ success: true, catFile });
                }
            });
        });
    });

    // Ждем выполнения всех котов
    return Promise.all(catPromises).then(results => {
        const successful = results.filter(r => r.success).length;
        console.log(`\n✨ Выполнено котов: ${successful}/${cats.length}`);

        return successful > 0;
    });
}

// Начальная синхронизация
function initialSync() {
    console.log('🔄 Начальная синхронизация...');
    const foundRats = scanForRats();
    const wasUpdated = updateMeow(foundRats);

    // Запускаем всех котов
    return runAllCats();
}

// Следит за изменениями в директории
function watchDirectory() {
    console.log('👁️  Начинаю наблюдение за директорией...');

    fs.watch(currentDir, (eventType, filename) => {
        // Игнорируем собственные изменения
        if (filename === 'meow.json' || filename === `${catalogName}.css` || filename?.includes('_yumiya.md')) {
            return;
        }

        // Обрабатываем крыс
        if (filename && filename.startsWith('rat_') && filename.endsWith('.css')) {
            console.log(`\n🔔 Обнаружено изменение крысы: ${filename} (${eventType})`);

            setTimeout(() => {
                const foundRats = scanForRats();
                const wasUpdated = updateMeow(foundRats);

                if (wasUpdated || eventType === 'change') {
                    runAllCats().then(success => {
                        if (success) {
                            console.log('🎉 Пересборка завершена!');
                        }
                    });
                }
            }, 100);
        }

        // Обрабатываем новых котов
        if (filename && filename.endsWith('.js') && filename.includes('cat') && filename !== 'dog.js') {
            console.log(`\n🆕 Обнаружен новый кот: ${filename} (${eventType})`);

            // Запускаем всех котов (включая нового)
            setTimeout(() => {
                runAllCats().then(success => {
                    if (success) {
                        console.log('🎉 Все коты выполнены!');
                    }
                });
            }, 100);
        }
    });
}

// Главная функция
async function startDog() {
    console.log(`\n🐕 SMART DOG для ${catalogName} запускается...`);
    console.log('====================================');

    // Инициализация
    initialize();

    // Начальная синхронизация
    const initialSuccess = await initialSync();

    if (initialSuccess) {
        console.log('✅ Начальная синхронизация завершена успешно');
    } else {
        console.log('⚠️  Начальная синхронизация частично не выполнена');
    }

    // Запуск наблюдения
    watchDirectory();

    console.log('====================================');
    console.log('✅ SMART DOG готов к работе!');
    console.log('Нажмите Ctrl+C для остановки\n');
}

// Обработка Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 SMART DOG останавливается...');
    process.exit(0);
});

// Запуск
startDog().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
});

/* === Новые возможности SMART DOG ===
// 1. Автоматически находит всех котов
// 2. Запускает их параллельно
// 3. Следит за появлением новых котов
// 4. Полная автоматизация без настройки
// 5. Детальная отчетность о выполнении
*/
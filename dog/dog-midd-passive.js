/* === dog-midd-passive.js === */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// MIDD собака для управления подкаталогами
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`🐕 DOG-MIDD запущен для каталога: ${catalogName}`);

// Находит всех MIDD котов
function findMiddCats() {
    const files = fs.readdirSync(currentDir);
    const middCats = files.filter(file =>
        file.endsWith('.js') &&
        file.startsWith('cat-midd-') &&
        file !== 'dog-midd-passive.js'
    );

    console.log(`🔍 Найдено MIDD котов: ${middCats.length} (${middCats.join(', ')})`);
    return middCats;
}

// Сканирует подкаталоги на наличие конструкторов и документаций
function scanSubdirectories() {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const subdirs = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

    const found = {
        constructors: [],
        documentations: []
    };

    console.log(`🔍 Сканирую ${subdirs.length} подкаталогов...`);

    subdirs.forEach(subdir => {
        const subdirName = subdir.name;
        const subdirPath = path.join(currentDir, subdirName);

        // Ищем конструктор (*.css с именем каталога)
        const constructorPath = path.join(subdirPath, `${subdirName}.css`);
        if (fs.existsSync(constructorPath)) {
            found.constructors.push(`${subdirName}/${subdirName}.css`);
            console.log(`  ✓ Конструктор: ${subdirName}.css`);
        }

        // Ищем документацию (*.md с именем каталога)
        const documentationPath = path.join(subdirPath, `${subdirName}.md`);
        if (fs.existsSync(documentationPath)) {
            found.documentations.push(`${subdirName}/${subdirName}.md`);
            console.log(`  ✓ Документация: ${subdirName}.md`);
        }
    });

    console.log(`📊 Найдено: ${found.constructors.length} конструкторов, ${found.documentations.length} документаций`);
    return found;
}

// Читает текущий rawr.json
function readRawr() {
    const rawrPath = path.join(currentDir, 'rawr.json');

    try {
        if (fs.existsSync(rawrPath)) {
            return JSON.parse(fs.readFileSync(rawrPath, 'utf8'));
        }
    } catch (error) {
        console.error('❌ Ошибка чтения rawr.json:', error);
    }

    // Создаем начальный rawr.json
    return {
        constructors: [],
        documentations: [],
        metadata: {
            level: "MIDD",
            catalog: catalogName,
            description: `Auto-generated MIDD config for ${catalogName}`,
            lastUpdate: new Date().toISOString()
        }
    };
}

// Обновляет rawr.json с найденными файлами
function updateRawr(found) {
    const rawr = readRawr();

    // Сравниваем найденные файлы с текущими
    const currentConstructors = new Set(rawr.constructors);
    const currentDocs = new Set(rawr.documentations);

    const newConstructors = found.constructors.filter(c => !currentConstructors.has(c));
    const removedConstructors = rawr.constructors.filter(c => !found.constructors.includes(c));

    const newDocs = found.documentations.filter(d => !currentDocs.has(d));
    const removedDocs = rawr.documentations.filter(d => !found.documentations.includes(d));

    let changed = false;

    // Обновляем конструкторы
    if (newConstructors.length > 0) {
        console.log(`➕ Добавляем новые конструкторы: ${newConstructors.join(', ')}`);
        rawr.constructors = rawr.constructors.concat(newConstructors);
        changed = true;
    }

    if (removedConstructors.length > 0) {
        console.log(`➖ Удаляем отсутствующие конструкторы: ${removedConstructors.join(', ')}`);
        rawr.constructors = rawr.constructors.filter(c => found.constructors.includes(c));
        changed = true;
    }

    // Обновляем документации
    if (newDocs.length > 0) {
        console.log(`➕ Добавляем новые документации: ${newDocs.join(', ')}`);
        rawr.documentations = rawr.documentations.concat(newDocs);
        changed = true;
    }

    if (removedDocs.length > 0) {
        console.log(`➖ Удаляем отсутствующие документации: ${removedDocs.join(', ')}`);
        rawr.documentations = rawr.documentations.filter(d => found.documentations.includes(d));
        changed = true;
    }

    // Сортируем для консистентности
    if (changed) {
        rawr.constructors.sort();
        rawr.documentations.sort();
        rawr.metadata.lastUpdate = new Date().toISOString();

        const rawrPath = path.join(currentDir, 'rawr.json');
        fs.writeFileSync(rawrPath, JSON.stringify(rawr, null, 2));
        console.log('✅ rawr.json обновлен');
        return true;
    }

    console.log('📋 Изменений не обнаружено');
    return false;
}

// Запускает всех MIDD котов
function runMiddCats() {
    const cats = findMiddCats();

    if (cats.length === 0) {
        console.log('⚠️  Не найдено ни одного MIDD кота!');
        return Promise.resolve();
    }

    console.log('🐱 Запускаем всех MIDD котов...');

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
        console.log(`\n✨ Выполнено MIDD котов: ${successful}/${cats.length}`);

        return successful > 0;
    });
}

// Начальная синхронизация
function initialSync() {
    console.log('🔄 Начальная синхронизация MIDD...');

    // Сканируем подкаталоги
    const found = scanSubdirectories();

    // Обновляем rawr.json
    const wasUpdated = updateRawr(found);

    // Запускаем всех MIDD котов
    return runMiddCats();
}

// Следит за изменениями
function watchDirectory() {
    console.log('👁️  Начинаю наблюдение за MIDD каталогом...');

    // Следим за текущим каталогом
    fs.watch(currentDir, { recursive: false }, (eventType, filename) => {
        // Игнорируем собственные изменения
        if (filename === 'rawr.json' || filename === `${catalogName}.css` || filename === `${catalogName}.md`) {
            return;
        }

        // Реагируем на новых MIDD котов
        if (filename && filename.startsWith('cat-midd-') && filename.endsWith('.js')) {
            console.log(`\n🆕 Обнаружен новый MIDD кот: ${filename} (${eventType})`);

            setTimeout(() => {
                runMiddCats().then(success => {
                    if (success) {
                        console.log('🎉 Все MIDD коты выполнены!');
                    }
                });
            }, 100);
        }
    });

    // Следим за подкаталогами
    const subdirs = fs.readdirSync(currentDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

    subdirs.forEach(subdir => {
        const subdirPath = path.join(currentDir, subdir.name);

        fs.watch(subdirPath, (eventType, filename) => {
            // Реагируем на изменения конструкторов и документаций
            if (filename === `${subdir.name}.css` || filename === `${subdir.name}.md`) {
                console.log(`\n🔔 Изменение в ${subdir.name}/: ${filename} (${eventType})`);

                setTimeout(() => {
                    const found = scanSubdirectories();
                    const wasUpdated = updateRawr(found);

                    if (wasUpdated || eventType === 'change') {
                        runMiddCats().then(success => {
                            if (success) {
                                console.log('🎉 MIDD пересборка завершена!');
                            }
                        });
                    }
                }, 100);
            }
        });
    });
}

// Главная функция
async function startMiddDog() {
    console.log(`\n🐕 DOG-MIDD для ${catalogName} запускается...`);
    console.log('====================================');

    // Начальная синхронизация
    const initialSuccess = await initialSync();

    if (initialSuccess) {
        console.log('✅ Начальная синхронизация MIDD завершена успешно');
    } else {
        console.log('⚠️  Начальная синхронизация MIDD частично не выполнена');
    }

    // Запуск наблюдения
    watchDirectory();

    console.log('====================================');
    console.log('✅ DOG-MIDD готов к работе!');
    console.log('Нажмите Ctrl+C для остановки\n');
}

// Обработка Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 DOG-MIDD останавливается...');
    process.exit(0);
});

// Запуск
startMiddDog().catch(error => {
    console.error('💥 Критическая ошибка MIDD:', error);
    process.exit(1);
});

/* === Возможности DOG-MIDD ===
// 1. Автоматически сканирует подкаталоги
// 2. Находит конструкторы и документации
// 3. Обновляет rawr.json
// 4. Запускает всех MIDD котов
// 5. Следит за изменениями в подкаталогах
// 6. Полностью универсальный - работает в любом MIDD каталоге
*/
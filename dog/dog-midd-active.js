/* === dog-midd-active.js === */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Активная MIDD собака - запускается по требованию
const currentDir = __dirname;
const catalogName = path.basename(currentDir);

console.log(`🐕⚡ DOG-MIDD-ACTIVE запущен для каталога: ${catalogName}`);

// Находит всех MIDD котов
function findMiddCats() {
    const files = fs.readdirSync(currentDir);
    const middCats = files.filter(file =>
        file.endsWith('.js') &&
        file.startsWith('cat-midd-') &&
        !file.includes('dog-midd')
    );

    console.log(`🔍 Найдено MIDD котов: ${middCats.length} (${middCats.join(', ')})`);
    return middCats;
}

// Сканирует подкаталоги
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

        // Ищем конструктор
        const constructorPath = path.join(subdirPath, `${subdirName}.css`);
        if (fs.existsSync(constructorPath)) {
            found.constructors.push(`${subdirName}/${subdirName}.css`);
            console.log(`  ✓ Конструктор: ${subdirName}.css`);
        }

        // Ищем документацию
        const documentationPath = path.join(subdirPath, `${subdirName}.md`);
        if (fs.existsSync(documentationPath)) {
            found.documentations.push(`${subdirName}/${subdirName}.md`);
            console.log(`  ✓ Документация: ${subdirName}.md`);
        }
    });

    console.log(`📊 Найдено: ${found.constructors.length} конструкторов, ${found.documentations.length} документаций`);
    return found;
}

// Обновляет rawr.json
function updateRawr(found) {
    const rawrPath = path.join(currentDir, 'rawr.json');
    let rawr;

    try {
        if (fs.existsSync(rawrPath)) {
            rawr = JSON.parse(fs.readFileSync(rawrPath, 'utf8'));
            console.log('📄 Загружен существующий rawr.json');
        } else {
            rawr = {
                constructors: [],
                documentations: [],
                metadata: {
                    level: "MIDD",
                    catalog: catalogName,
                    description: `Auto-generated MIDD config for ${catalogName}`,
                    lastUpdate: new Date().toISOString()
                }
            };
            console.log('📝 Создан новый rawr.json');
        }
    } catch (error) {
        console.error('❌ Ошибка работы с rawr.json:', error);
        return false;
    }

    // Полностью перезаписываем (активный режим)
    rawr.constructors = found.constructors.sort();
    rawr.documentations = found.documentations.sort();
    rawr.metadata.lastUpdate = new Date().toISOString();

    try {
        fs.writeFileSync(rawrPath, JSON.stringify(rawr, null, 2));
        console.log('✅ rawr.json обновлен');
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения rawr.json:', error);
        return false;
    }
}

// Запускает всех MIDD котов
async function runMiddCats() {
    const cats = findMiddCats();

    if (cats.length === 0) {
        console.log('⚠️  Не найдено ни одного MIDD кота!');
        return false;
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
    try {
        const results = await Promise.all(catPromises);
        const successful = results.filter(r => r.success).length;
        console.log(`\n✨ Выполнено MIDD котов: ${successful}/${cats.length}`);

        return successful > 0;
    } catch (error) {
        console.error('❌ Ошибка выполнения котов:', error);
        return false;
    }
}

// Главная функция
async function runActiveSequence() {
    console.log(`\n🐕⚡ DOG-MIDD-ACTIVE начинает активную сборку...`);
    console.log('====================================');

    // Шаг 1: Сканируем подкаталоги
    const found = scanSubdirectories();

    // Шаг 2: Обновляем rawr.json
    const rawrUpdated = updateRawr(found);
    if (!rawrUpdated) {
        console.log('❌ Не удалось обновить rawr.json');
        process.exit(1);
    }

    // Шаг 3: Запускаем всех MIDD котов
    const catsSuccess = await runMiddCats();

    console.log('====================================');

    if (catsSuccess) {
        console.log('✅ Активная сборка MIDD завершена успешно!');
        console.log(`📁 Создан: ${catalogName}.css`);
        console.log(`📚 Создан: ${catalogName}.md`);
    } else {
        console.log('⚠️  Активная сборка завершена с ошибками');
    }

    console.log('\n🔚 DOG-MIDD-ACTIVE завершает работу');
    process.exit(catsSuccess ? 0 : 1);
}

// Запуск
runActiveSequence().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
});

/* === dog-midd-active CLI ===
// Простое использование:
// $ node dog-midd-active.js

// Добавляет новый подкаталог и сразу пересобирает:
// $ mkdir new-subdir
// $ cp cat.js cat-yumiia.js new-subdir/
// $ node dog-midd-active.js

// Или через npm script:
// "scripts": {
//   "midd:build": "node dog-midd-active.js"
// }
*/
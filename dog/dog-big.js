/* === dog-big.js === */
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

// Главная собака - рекурсивный сборщик всей системы
const startDir = __dirname;
const catalogName = path.basename(startDir);

console.log(`🐕👑 DOG-BIG запущен в каталоге: ${catalogName}`);
console.log('====================================');

// Находит всех собак в директории
function findDogs(directory) {
    const files = fs.readdirSync(directory);
    const dogs = {
        leaf: [], // dog.js
        midd: [], // dog-midd*.js (любые вариации)
        big: null // dog-big.js (эта собака)
    };

    files.forEach(file => {
        if (file.endsWith('.js') && file.includes('dog')) {
            if (file === 'dog.js') {
                dogs.leaf.push(file);
            } else if (file.startsWith('dog-midd')) {
                dogs.midd.push(file);
            } else if (file === 'dog-big.js') {
                dogs.big = file;
            }
        }
    });

    return dogs;
}

// Проверяет наличие собранных файлов
function hasBuiltFiles(directory) {
    const dirName = path.basename(directory);
    const constructorPath = path.join(directory, `${dirName}.css`);
    const documentationPath = path.join(directory, `${dirName}.md`);

    return {
        constructor: fs.existsSync(constructorPath),
        documentation: fs.existsSync(documentationPath),
        both: fs.existsSync(constructorPath) && fs.existsSync(documentationPath)
    };
}

// Запускает собаку и ждет результата
function runDog(dogPath, directory) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Запуск собаки: ${dogPath} в ${directory}`);

        const startTime = Date.now();

        // Запускаем собаку
        const dog = spawn('node', [dogPath], {
            cwd: directory,
            stdio: ['inherit', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        dog.stdout.on('data', (data) => {
            output += data.toString();
            // Выводим в реальном времени
            process.stdout.write(data);
        });

        dog.stderr.on('data', (data) => {
            error += data.toString();
            process.stderr.write(data);
        });

        // Периодически проверяем, создались ли файлы
        const checkInterval = setInterval(() => {
            const files = hasBuiltFiles(directory);

            if (files.both) {
                console.log(`✅ Файлы созданы, останавливаем собаку...`);
                dog.kill('SIGTERM');
                clearInterval(checkInterval);

                const duration = Date.now() - startTime;
                resolve({
                    success: true,
                    duration,
                    output,
                    files
                });
            }
        }, 500);

        // Таймаут на случай зависания
        const timeout = setTimeout(() => {
            console.log(`⏰ Таймаут, останавливаем собаку...`);
            dog.kill('SIGTERM');
            clearInterval(checkInterval);

            const files = hasBuiltFiles(directory);
            resolve({
                success: files.both,
                timeout: true,
                output,
                error,
                files
            });
        }, 30000); // 30 секунд максимум

        dog.on('close', (code) => {
            clearInterval(checkInterval);
            clearTimeout(timeout);

            const duration = Date.now() - startTime;
            const files = hasBuiltFiles(directory);

            resolve({
                success: files.both,
                code,
                duration,
                output,
                error,
                files
            });
        });

        dog.on('error', (err) => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            reject(err);
        });
    });
}

// Рекурсивный проход по директориям
async function recursiveBuild(directory, level = 0) {
    const indent = '  '.repeat(level);
    const dirName = path.basename(directory);

    console.log(`\n${indent}📁 Обрабатываю каталог: ${dirName} (уровень ${level})`);

    // Находим собак в текущей директории
    const dogs = findDogs(directory);
    console.log(`${indent}🔍 Найдено собак: leaf=${dogs.leaf.length}, midd=${dogs.midd.length}`);

    // Сначала ищем подкаталоги
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const subdirs = entries.filter(entry =>
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        !entry.name.includes('node_modules')
    );

    // Если есть подкаталоги, рекурсивно обрабатываем их
    if (subdirs.length > 0) {
        console.log(`${indent}📦 Найдено подкаталогов: ${subdirs.length}`);

        for (const subdir of subdirs) {
            const subdirPath = path.join(directory, subdir.name);
            await recursiveBuild(subdirPath, level + 1);
        }
    }

    // После обработки всех подкаталогов, запускаем собаку текущего уровня
    if (dogs.leaf.length > 0 || dogs.midd.length > 0) {
        // Выбираем подходящую собаку
        let dogToRun = null;

        if (subdirs.length === 0 && dogs.leaf.length > 0) {
            // Это LEAF уровень, запускаем leaf собаку
            dogToRun = dogs.leaf[0];
            console.log(`${indent}🐕 Запускаю LEAF собаку: ${dogToRun}`);
        } else if (subdirs.length > 0 && dogs.midd.length > 0) {
            // Это MIDD уровень, запускаем midd собаку
            dogToRun = dogs.midd[0];
            console.log(`${indent}🐕 Запускаю MIDD собаку: ${dogToRun}`);
        }

        if (dogToRun) {
            try {
                const result = await runDog(dogToRun, directory);

                if (result.success) {
                    console.log(`${indent}✅ Успешно создан ${dirName}.css и ${dirName}.md`);
                    console.log(`${indent}⏱️  Время выполнения: ${(result.duration / 1000).toFixed(2)}s`);
                } else {
                    console.log(`${indent}⚠️  Частичный успех в ${dirName}:`, result.files);
                }
            } catch (error) {
                console.error(`${indent}❌ Ошибка при запуске ${dogToRun}:`, error);
            }
        }
    }

    // Проверяем, созданы ли файлы на текущем уровне
    const files = hasBuiltFiles(directory);
    if (files.both) {
        console.log(`${indent}✨ Каталог ${dirName} успешно собран!`);
    } else {
        console.log(`${indent}⚠️  Сборка ${dirName} незавершена:`, files);
    }

    return files.both;
}

// Главная функция
async function startBigDog() {
    console.log('🐕👑 DOG-BIG начинает рекурсивную сборку проекта...');
    console.log('====================================');

    const overallStartTime = Date.now();

    try {
        // Запускаем рекурсивную сборку
        const success = await recursiveBuild(startDir);

        const overallDuration = Date.now() - overallStartTime;

        console.log('\n====================================');
        console.log(`🏁 DOG-BIG завершила работу за ${(overallDuration / 1000).toFixed(2)}s`);

        if (success) {
            console.log('✅ Весь проект успешно собран!');
            console.log(`📁 Создан: ${catalogName}.css`);
            console.log(`📚 Создан: ${catalogName}.md`);
        } else {
            console.log('⚠️  Сборка завершена с ошибками');
        }

        process.exit(0);
    } catch (error) {
        console.error('💥 Критическая ошибка:', error);
        process.exit(1);
    }
}

// Обработка Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 DOG-BIG останавливается...');
    process.exit(0);
});

// Запуск
startBigDog();

/* === DOG-BIG Принцип работы ===
// 1. Рекурсивно проходит по всем каталогам
// 2. Находит всех собак (dog.js, dog-midd*.js)
// 3. Сначала обрабатывает подкаталоги (LEAF → MIDD)
// 4. Запускает подходящую собаку на каждом уровне
// 5. Ждет создания файлов и останавливает собаку
// 6. Поднимается вверх, собирая проект от листьев к корню
// 7. В итоге создает финальные файлы на верхнем уровне
*/
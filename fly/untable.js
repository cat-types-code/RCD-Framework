#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Создаем интерфейс для чтения ввода пользователя
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Настройки по умолчанию
const defaultOptions = {
    path: '.',
    output: null,
    depth: Infinity,
    exclude: ['node_modules', '.git'],
    showFiles: true
};

// Текущие настройки (копия defaultOptions)
let currentOptions = { ...defaultOptions };

// Функция сканирования директории
function scanDirectory(dirPath, options) {
    console.log(`🦋 Сканирую структуру директории: ${dirPath}`);

    // Получаем имя корневой директории
    const rootName = path.basename(dirPath);

    // Начинаем с корневой директории
    let result = `${rootName}/\n`;

    // Рекурсивно добавляем содержимое
    result += scanRecursive(dirPath, '', 0, options);

    return result;
}

// Рекурсивно сканирует директорию и строит ASCII-представление
function scanRecursive(dirPath, prefix, depth, options) {
    // Если достигли максимальной глубины, останавливаемся
    if (depth >= options.depth) {
        return '';
    }

    let result = '';

    try {
        // Читаем содержимое директории
        const items = fs.readdirSync(dirPath);

        // Сортируем: сначала директории, потом файлы
        const sorted = items.sort((a, b) => {
            const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
            const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();

            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

        // Обрабатываем каждый элемент
        for (let i = 0; i < sorted.length; i++) {
            const item = sorted[i];
            const itemPath = path.join(dirPath, item);
            const isLast = i === sorted.length - 1;

            // Пропускаем исключенные директории
            const isDir = fs.statSync(itemPath).isDirectory();
            if (isDir && options.excludeDirs.includes(item)) {
                continue;
            }

            // Не показываем файлы, если опция выключена
            if (!isDir && !options.showFiles) {
                continue;
            }

            // Определяем префиксы для текущего элемента и дочерних элементов
            const currentPrefix = isLast ? '└── ' : '├── ';
            const childPrefix = isLast ? '    ' : '│   ';

            // Добавляем текущий элемент
            result += `${prefix}${currentPrefix}${item}${isDir ? '/' : ''}\n`;

            // Если это директория, рекурсивно добавляем ее содержимое
            if (isDir) {
                result += scanRecursive(
                    itemPath,
                    prefix + childPrefix,
                    depth + 1,
                    options
                );
            }
        }
    } catch (error) {
        console.error(`Ошибка при сканировании ${dirPath}: ${error.message}`);
    }

    return result;
}

// Сохранение ASCII-представления в файл
function saveToFile(ascii, outputPath) {
    try {
        fs.writeFileSync(outputPath, ascii);
        return true;
    } catch (error) {
        console.error(`Ошибка при сохранении файла: ${error.message}`);
        return false;
    }
}

// Очистка консоли
function clearConsole() {
    process.stdout.write('\x1Bc');
}

// Форматирование текущих настроек для отображения
function formatCurrentSettings() {
    return `
📋 Текущие настройки:
  📁 Директория: ${currentOptions.path === '.' ? 'Текущая директория' : currentOptions.path}
  🔍 Глубина сканирования: ${currentOptions.depth === Infinity ? 'Без ограничений' : currentOptions.depth}
  🚫 Исключаемые директории: ${currentOptions.exclude.join(', ')}
  📄 Показывать файлы: ${currentOptions.showFiles ? 'Да' : 'Нет'}
  💾 Сохранение результата: ${currentOptions.output ? `В файл "${currentOptions.output}"` : 'Только в консоль'}
`;
}

// Отображение главного меню
function showMainMenu() {
    clearConsole();
    console.log('🦋 Untable - генерация ASCII-деревьев из структуры директорий');
    console.log(formatCurrentSettings());
    console.log(`
📜 Главное меню:
  1️⃣ Сканировать директорию (быстрый режим)
  2️⃣ Изменить настройки
  3️⃣ Сохранить настройки по умолчанию
  4️⃣ Выход

👉 Выберите пункт меню (1-4): `);

    rl.question('', (choice) => {
        switch (choice.trim()) {
            case '1':
                quickScan();
                break;
            case '2':
                showSettingsMenu();
                break;
            case '3':
                saveDefaultSettings();
                break;
            case '4':
                console.log('👋 До свидания!');
                rl.close();
                break;
            default:
                console.log('❌ Некорректный выбор. Нажмите Enter для продолжения...');
                rl.question('', () => showMainMenu());
        }
    });
}

// Быстрое сканирование (опция 1)
function quickScan() {
    clearConsole();
    console.log('🔍 Быстрое сканирование директории');
    console.log('Нажмите Enter, чтобы использовать текущие настройки, или введите новый путь:');

    rl.question('📁 Путь к директории: ', (inputPath) => {
        // Если пользователь ввел путь, используем его, иначе используем текущее значение
        const dirPath = inputPath.trim() || currentOptions.path;

        // Проверяем существование директории
        if (!fs.existsSync(dirPath)) {
            console.log(`❌ Директория "${dirPath}" не существует`);
            rl.question('Нажмите Enter для продолжения...', () => showMainMenu());
            return;
        }

        if (!fs.statSync(dirPath).isDirectory()) {
            console.log(`❌ "${dirPath}" не является директорией`);
            rl.question('Нажмите Enter для продолжения...', () => showMainMenu());
            return;
        }

        // Запоминаем путь в текущих настройках
        currentOptions.path = dirPath;

        // Сканируем директорию
        const ascii = scanDirectory(dirPath, {
            maxDepth: currentOptions.depth,
            excludeDirs: currentOptions.exclude,
            showFiles: currentOptions.showFiles
        });

        // Выводим результат
        console.log('\n📊 ASCII-структура директории:');
        console.log(ascii);

        // Спрашиваем, нужно ли сохранить в файл
        rl.question('\n💾 Сохранить результат в файл? (путь/n): ', (outputPath) => {
            if (outputPath.toLowerCase() !== 'n' && outputPath.trim() !== '') {
                if (saveToFile(ascii, outputPath)) {
                    console.log(`✅ ASCII-структура сохранена в файл: ${outputPath}`);

                    // Обновляем настройки
                    currentOptions.output = outputPath;
                }
            }

            rl.question('\nНажмите Enter для возврата в главное меню...', () => showMainMenu());
        });
    });
}

// Меню настроек (опция 2)
function showSettingsMenu() {
    clearConsole();
    console.log('⚙️ Меню настроек');
    console.log(formatCurrentSettings());
    console.log(`
Выберите настройку для изменения:
  1️⃣ Изменить директорию для сканирования
  2️⃣ Изменить глубину сканирования
  3️⃣ Настроить исключаемые директории
  4️⃣ Включить/выключить отображение файлов
  5️⃣ Настроить сохранение результата
  6️⃣ Вернуться в главное меню

👉 Выберите пункт меню (1-6): `);

    rl.question('', (choice) => {
        switch (choice.trim()) {
            case '1':
                changeScanDirectory();
                break;
            case '2':
                changeScanDepth();
                break;
            case '3':
                changeExcludedDirectories();
                break;
            case '4':
                toggleShowFiles();
                break;
            case '5':
                changeOutputSetting();
                break;
            case '6':
                showMainMenu();
                break;
            default:
                console.log('❌ Некорректный выбор. Нажмите Enter для продолжения...');
                rl.question('', () => showSettingsMenu());
        }
    });
}

// Изменение директории для сканирования
function changeScanDirectory() {
    clearConsole();
    console.log('📁 Изменение директории для сканирования');
    console.log(`Текущее значение: ${currentOptions.path}`);

    rl.question('Введите новый путь (или Enter для отмены): ', (input) => {
        if (input.trim()) {
            if (fs.existsSync(input) && fs.statSync(input).isDirectory()) {
                currentOptions.path = input;
                console.log(`✅ Директория для сканирования изменена на: ${input}`);
            } else {
                console.log(`❌ "${input}" не существует или не является директорией`);
            }
        }

        rl.question('Нажмите Enter для продолжения...', () => showSettingsMenu());
    });
}

// Изменение глубины сканирования
function changeScanDepth() {
    clearConsole();
    console.log('🔍 Изменение глубины сканирования');
    console.log(`Текущее значение: ${currentOptions.depth === Infinity ? 'Без ограничений' : currentOptions.depth}`);

    rl.question('Введите новую глубину (число или "unlimited" для снятия ограничений): ', (input) => {
        if (input.trim()) {
            if (input.toLowerCase() === 'unlimited') {
                currentOptions.depth = Infinity;
                console.log('✅ Глубина сканирования: Без ограничений');
            } else {
                const depth = parseInt(input);
                if (!isNaN(depth) && depth >= 0) {
                    currentOptions.depth = depth;
                    console.log(`✅ Глубина сканирования изменена на: ${depth}`);
                } else {
                    console.log('❌ Некорректное значение. Глубина должна быть положительным числом.');
                }
            }
        }

        rl.question('Нажмите Enter для продолжения...', () => showSettingsMenu());
    });
}

// Изменение исключаемых директорий
function changeExcludedDirectories() {
    clearConsole();
    console.log('🚫 Настройка исключаемых директорий');
    console.log(`Текущие исключения: ${currentOptions.exclude.join(', ')}`);

    rl.question('Введите новый список через запятую (или Enter для отмены): ', (input) => {
        if (input.trim()) {
            currentOptions.exclude = input.split(',').map(item => item.trim()).filter(Boolean);
            console.log(`✅ Исключаемые директории обновлены: ${currentOptions.exclude.join(', ')}`);
        }

        rl.question('Нажмите Enter для продолжения...', () => showSettingsMenu());
    });
}

// Включение/выключение отображения файлов
function toggleShowFiles() {
    currentOptions.showFiles = !currentOptions.showFiles;
    console.log(`✅ Отображение файлов ${currentOptions.showFiles ? 'включено' : 'выключено'}`);

    rl.question('Нажмите Enter для продолжения...', () => showSettingsMenu());
}

// Настройка сохранения результата
function changeOutputSetting() {
    clearConsole();
    console.log('💾 Настройка сохранения результата');
    console.log(`Текущее значение: ${currentOptions.output ? `В файл "${currentOptions.output}"` : 'Только в консоль'}`);

    rl.question('Введите путь для сохранения (или "console" для вывода только в консоль): ', (input) => {
        if (input.trim()) {
            if (input.toLowerCase() === 'console') {
                currentOptions.output = null;
                console.log('✅ Результат будет выводиться только в консоль');
            } else {
                currentOptions.output = input;
                console.log(`✅ Результат будет сохраняться в файл: ${input}`);
            }
        }

        rl.question('Нажмите Enter для продолжения...', () => showSettingsMenu());
    });
}

// Сохранение текущих настроек как настроек по умолчанию
function saveDefaultSettings() {
    try {
        // Получаем путь к директории, где находится скрипт
        const scriptDir = __dirname;
        const configPath = path.join(scriptDir, '.untable_config.json');

        // Сохраняем настройки в JSON-файл
        fs.writeFileSync(configPath, JSON.stringify(currentOptions, null, 2));

        console.log(`✅ Настройки сохранены в ${configPath}`);
        rl.question('Нажмите Enter для продолжения...', () => showMainMenu());
    } catch (error) {
        console.error(`❌ Ошибка при сохранении настроек: ${error.message}`);
        rl.question('Нажмите Enter для продолжения...', () => showMainMenu());
    }
}

// Загрузка сохраненных настроек
function loadSavedSettings() {
    try {
        // Получаем путь к директории, где находится скрипт
        const scriptDir = __dirname;
        const configPath = path.join(scriptDir, '.untable_config.json');

        // Проверяем, существует ли файл настроек
        if (fs.existsSync(configPath)) {
            const savedSettings = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            // Обновляем текущие настройки
            currentOptions = { ...defaultOptions, ...savedSettings };

            console.log('📝 Загружены сохраненные настройки');
        }
    } catch (error) {
        console.error(`⚠️ Ошибка при загрузке настроек: ${error.message}`);
        console.log('🔄 Используются настройки по умолчанию');
    }
}

// Проверка аргументов командной строки
const args = process.argv.slice(2);

// Если передан аргумент --help или -h, показываем справку и выходим
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
untable - Генерация ASCII-представления структуры директорий

Использование: untable [опции]

Опции:
  --path=DIR      Путь к директории (быстрое сканирование без меню)
  --help, -h      Показать эту справку

Без аргументов запускается интерактивное меню.
  `);
    process.exit(0);
}

// Если передан аргумент --path, выполняем быстрое сканирование и выходим
for (const arg of args) {
    if (arg.startsWith('--path=')) {
        const dirPath = arg.substring(7);

        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
            console.error(`❌ Ошибка: директория "${dirPath}" не существует или не является директорией`);
            process.exit(1);
        }

        const ascii = scanDirectory(dirPath, {
            maxDepth: defaultOptions.depth,
            excludeDirs: defaultOptions.exclude,
            showFiles: defaultOptions.showFiles
        });

        console.log(ascii);
        process.exit(0);
    }
}

// Загружаем сохраненные настройки и показываем главное меню
loadSavedSettings();
showMainMenu();
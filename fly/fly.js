// fly.js - Главный файл мухи
const path = require('path');
const Jelly = require('./fly_jelly');
const Brain = require('./fly_brain');
const legs = require('./fly_legs');

/**
 * Муха RCD Garden - создает файловую структуру из текстового представления
 */
class Fly {
    /**
     * Конструктор мухи
     */
    constructor() {
        // Создаем варенье (источник данных)
        this.jelly = new Jelly(path.join(__dirname, 'table.txt'));

        // Создаем мозг мухи (логика)
        this.brain = new Brain();
    }

    /**
     * Запускает муху
     * @param {string} outputDir - Каталог для создания структуры
     */
    // fly.js - обновленная версия с предварительной очисткой

    run(outputDir) {
        console.log('🪰 Муха начинает работу...');

        try {
            // Получаем данные из варенья (уже с очисткой комментариев)
            const asciiTree = this.jelly.getData();

            // Парсим структуру с помощью мозга
            const paths = this.brain.parseTree(asciiTree);

            // Создаем структуру
            this.brain.createStructure(paths, outputDir);

            // Используем лапки для дополнительных операций
            console.log('🦿 Запускаю лапки мухи...');

            legs.leg1(outputDir);

            legs.leg2(outputDir);

            legs.leg3(outputDir);

            console.log('✅ Муха успешно завершила работу!');
        } catch (error) {
            console.error(`❌ Ошибка: ${error.message}`);
        }
    }
}

// Запускаем, если вызвано напрямую из командной строки
if (require.main === module) {
    const outputDir = process.argv[2] || './output';
    const fly = new Fly();
    fly.run(outputDir);
}

module.exports = Fly;
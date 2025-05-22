// fly_jelly.js - Варенье для мухи (источник данных) с предварительной обработкой
const fs = require('fs');
const path = require('path');

/**
 * Класс "Варенье" - источник данных для мухи
 */
class Jelly {
    /**
     * Создает экземпляр "Варенье"
     * @param {string} tablePath - Путь к файлу с ASCII-структурой
     */
    constructor(tablePath) {
        this.tablePath = tablePath;
        this.ensureTableExists();
    }

    /**
     * Убеждается, что файл table.txt существует
     */
    ensureTableExists() {
        if (!fs.existsSync(this.tablePath)) {
            const sampleTree = `# Вставьте сюда структуру проекта
# Пример:
project/
├── src/
│   ├── components/
│   │   ├── Button.js
│   │   └── Header.js
│   └── index.js
└── package.json
`;
            fs.writeFileSync(this.tablePath, sampleTree);
            console.log(`🍯 Создано варенье (файл): ${this.tablePath}`);
        }
    }

    /**
     * Получает данные из файла с предварительной обработкой
     * @returns {string} - Обработанное содержимое файла
     */
    getData() {
        try {
            // Получаем исходное содержимое
            const rawData = fs.readFileSync(this.tablePath, 'utf8');

            // Предварительная обработка - очистка комментариев
            console.log('🍯 Варенье проводит предварительную обработку структуры...');
            const cleanedData = this.cleanComments(rawData);

            return cleanedData;
        } catch (error) {
            throw new Error(`Не удалось получить данные из файла: ${error.message}`);
        }
    }

    /**
     * Улучшенная версия метода очистки комментариев
     * @param {string} asciiTree - ASCII-структура с комментариями
     * @returns {string} - ASCII-структура без комментариев
     */
    cleanComments(asciiTree) {
        // Просто передаем данные как есть, основная обработка в Brain
        return asciiTree;
    }
}

module.exports = Jelly;
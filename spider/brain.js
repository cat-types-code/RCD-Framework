// brain.js - Экспериментальная компонента для паука

/**
 * Генерирует случайное дерево для тестирования
 * @param {number} maxDepth - Максимальная глубина дерева (не больше 26)
 * @param {number} totalNodes - Общее количество узлов (не считая корень)
 * @param {number} maxChildren - Максимальное количество детей у одного узла
 * @returns {Object} - Структура дерева
 */
function generateRandomTree(maxDepth = 5, totalNodes = 20, maxChildren = 5) {
    // Ограничиваем глубину до 26 (количество букв в английском алфавите)
    maxDepth = Math.min(maxDepth, 26);

    // Создаем корневой узел
    const root = {
        type: 'directory',
        name: 'Root',
        depth: 0,
        letter: 'A',
        index: 0,
        children: [],
        files: []
    };

    // Узлы, к которым можно добавить детей
    const availableParents = [root];

    // Добавляем узлы, пока не достигнем totalNodes
    let nodesAdded = 0;

    while (nodesAdded < totalNodes && availableParents.length > 0) {
        // Выбираем случайного родителя
        const parentIndex = Math.floor(Math.random() * availableParents.length);
        const parent = availableParents[parentIndex];

        // Если родитель достиг максимальной глубины или макс. количества детей, удаляем его из доступных
        if (parent.depth >= maxDepth - 1 || parent.children.length >= maxChildren) {
            availableParents.splice(parentIndex, 1);
            continue;
        }

        // Определяем букву для нового узла (следующая по глубине)
        const nodeLetter = String.fromCharCode(65 + parent.depth + 1); // A=65, B=66, ...

        // Определяем индекс в текущей глубине
        const nodeIndex = findNextIndexInDepth(root, parent.depth + 1);

        // Создаем новый узел
        const newNode = {
            type: 'directory',
            name: `${nodeLetter}${nodeIndex}`,
            depth: parent.depth + 1,
            letter: nodeLetter,
            index: nodeIndex,
            children: [],
            files: []
        };

        // Добавляем случайное количество файлов
        const numFiles = Math.floor(Math.random() * 3); // 0-2 файла
        for (let i = 0; i < numFiles; i++) {
            newNode.files.push({
                type: 'file',
                name: `file_${newNode.name}_${i + 1}.txt`,
                content: `This is a test file ${i + 1} in directory ${newNode.name}`
            });
        }

        // Добавляем новый узел к родителю
        parent.children.push(newNode);

        // Добавляем новый узел к доступным родителям
        availableParents.push(newNode);

        nodesAdded++;
    }

    return root;
}

/**
 * Находит следующий доступный индекс на заданной глубине
 * @param {Object} root - Корневой узел дерева
 * @param {number} depth - Глубина для поиска
 * @returns {number} - Следующий доступный индекс
 */
function findNextIndexInDepth(root, depth) {
    const indices = findAllIndicesAtDepth(root, depth);
    return indices.length > 0 ? Math.max(...indices) + 1 : 1;
}

/**
 * Находит все индексы узлов на заданной глубине
 * @param {Object} node - Текущий узел
 * @param {number} targetDepth - Целевая глубина
 * @param {number} currentDepth - Текущая глубина
 * @returns {Array<number>} - Все индексы на заданной глубине
 */
function findAllIndicesAtDepth(node, targetDepth, currentDepth = 0) {
    let indices = [];

    if (currentDepth === targetDepth) {
        indices.push(node.index);
    } else {
        for (const child of node.children) {
            indices = indices.concat(
                findAllIndicesAtDepth(child, targetDepth, currentDepth + 1)
            );
        }
    }

    return indices;
}

/**
 * Преобразует дерево в формат Markdown
 * @param {Object} tree - Дерево для преобразования
 * @returns {string} - Markdown-представление дерева
 */
function treeToMarkdown(tree) {
    let markdown = '';

    function processNode(node, depth = 0) {
        // Создаем заголовок для каталога
        const heading = '#'.repeat(depth + 1);
        const title = depth === 0 ? '[00] Root' : `[${node.letter}${node.index}] ${node.name}`;

        markdown += `${heading} ${title}\n`;
        markdown += `Каталог на глубине ${depth}, индекс ${node.index}\n\n`;

        // Добавляем файлы
        for (const file of node.files) {
            markdown += `- \`${file.name}\`:\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
        }

        // Рекурсивно обрабатываем дочерние узлы
        for (const child of node.children) {
            processNode(child, depth + 1);
        }
    }

    // Начинаем с корневого узла
    processNode(tree);

    return markdown;
}

/**
 * Генерирует и сохраняет случайное дерево в формате Markdown
 * @param {string} filePath - Путь для сохранения файла
 * @param {Object} options - Параметры генерации
 */
function generateRandomMarkdown(filePath, options = {}) {
    const { maxDepth = 5, totalNodes = 20, maxChildren = 5 } = options;

    // Генерируем случайное дерево
    const tree = generateRandomTree(maxDepth, totalNodes, maxChildren);

    // Преобразуем в Markdown
    const markdown = treeToMarkdown(tree);

    // Сохраняем в файл
    const fs = require('fs');
    fs.writeFileSync(filePath, markdown, 'utf8');

    console.log(`🧠 Brain создал случайный Markdown: ${filePath}`);
    console.log(`   Глубина: ${maxDepth}, Узлов: ${totalNodes}, Макс. детей: ${maxChildren}`);
}

module.exports = {
    generateRandomTree,
    treeToMarkdown,
    generateRandomMarkdown
};
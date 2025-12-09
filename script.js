// Объявление переменных для элементов DOM
const listElement = document.querySelector('.to-do__list');
const formElement = document.querySelector('.to-do__form');
const inputElement = document.querySelector('.to-do__input');
const itemTemplate = document.getElementById('to-do__item-template');
const clearAllButton = document.getElementById('clear-all');
const totalTasksElement = document.getElementById('total-tasks');
const saveStatusElement = document.getElementById('save-status');

// Предустановленные задачи для первого запуска
const defaultItems = [
    'Посмотреть урок по React',
    'Сделать домашнее задание',
    'Подготовиться к собеседованию',
    'Почитать документацию',
    'Написать тесты для проекта',
    'Отрефакторить код'
];

// Функция для обновления счетчика задач
function updateTasksCounter() {
    const items = getTasksFromDOM();
    totalTasksElement.textContent = items.length;
}

// Функция для получения задач из локального хранилища
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
        try {
            return JSON.parse(savedTasks);
        } catch (error) {
            console.error('Ошибка при чтении задач из хранилища:', error);
            return defaultItems;
        }
    } else {
        return defaultItems;
    }
}

// Функция для сохранения задач в локальное хранилище
function saveTasks(tasks) {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        // Показываем статус сохранения
        saveStatusElement.textContent = 'сохранено';
        saveStatusElement.style.color = '#10b981';
        
        setTimeout(() => {
            saveStatusElement.textContent = 'включено';
            saveStatusElement.style.color = '#0369a1';
        }, 2000);
    } catch (error) {
        console.error('Ошибка при сохранении задач:', error);
        saveStatusElement.textContent = 'ошибка';
        saveStatusElement.style.color = '#ef4444';
    }
}

// Функция для получения задач из текущей разметки
function getTasksFromDOM() {
    const itemsNamesElements = listElement.querySelectorAll('.to-do__item-text');
    const tasks = [];
    
    itemsNamesElements.forEach(element => {
        tasks.push(element.textContent);
    });
    
    return tasks;
}

// Функция для создания элемента задачи
function createItem(itemText) {
    // Клонируем шаблон
    const clone = itemTemplate.content.cloneNode(true);
    
    // Находим элементы внутри клона
    const listItem = clone.querySelector('.to-do__item');
    const textElement = clone.querySelector('.to-do__item-text');
    const deleteButton = clone.querySelector('.to-do__item-button_type_delete');
    const duplicateButton = clone.querySelector('.to-do__item-button_type_duplicate');
    const editButton = clone.querySelector('.to-do__item-button_type_edit');
    
    // Устанавливаем текст задачи
    textElement.textContent = itemText;
    
    // Обработчик для кнопки удаления
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        
        // Плавное удаление с анимацией
        listItem.style.opacity = '0';
        listItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            listItem.remove();
            
            // Обновляем локальное хранилище и счетчик
            const items = getTasksFromDOM();
            saveTasks(items);
            updateTasksCounter();
        }, 300);
    });
    
    // Обработчик для кнопки копирования
    duplicateButton.addEventListener('click', (event) => {
        event.stopPropagation();
        
        // Получаем текст текущей задачи
        const currentText = textElement.textContent;
        
        // Создаем копию задачи
        const newItem = createItem(currentText);
        
        // Добавляем копию в начало списка
        listElement.prepend(newItem);
        
        // Обновляем локальное хранилище и счетчик
        const items = getTasksFromDOM();
        saveTasks(items);
        updateTasksCounter();
    });
    
    // Обработчик для кнопки редактирования
    editButton.addEventListener('click', (event) => {
        event.stopPropagation();
        
        // Делаем элемент редактируемым и устанавливаем фокус
        textElement.setAttribute('contenteditable', 'true');
        textElement.focus();
        
        // Выделяем весь текст для удобства редактирования
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    });
    
    // Обработчик для потери фокуса при редактировании
    textElement.addEventListener('blur', () => {
        // Отключаем режим редактирования
        textElement.setAttribute('contenteditable', 'false');
        
        // Обрезаем лишние пробелы
        const trimmedText = textElement.textContent.trim();
        
        // Если текст пустой, удаляем задачу
        if (trimmedText === '') {
            listItem.remove();
        } else {
            textElement.textContent = trimmedText;
        }
        
        // Обновляем локальное хранилище
        const items = getTasksFromDOM();
        saveTasks(items);
    });
    
    // Обработчик для сохранения по нажатию Enter при редактировании
    textElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && textElement.getAttribute('contenteditable') === 'true') {
            event.preventDefault();
            textElement.blur(); // Снимаем фокус, что вызовет событие blur
        }
        
        // Отмена редактирования по Escape
        if (event.key === 'Escape' && textElement.getAttribute('contenteditable') === 'true') {
            event.preventDefault();
            textElement.setAttribute('contenteditable', 'false');
            textElement.textContent = itemText; // Восстанавливаем оригинальный текст
        }
    });
    
    // Обработчик клика на всей задаче (для выделения)
    listItem.addEventListener('click', (event) => {
        if (!event.target.closest('.to-do__item-button')) {
            listItem.classList.toggle('to-do__item--selected');
        }
    });
    
    return clone;
}

// Функция для отображения задач на странице
function renderTasks() {
    // Получаем текущие задачи
    const items = loadTasks();
    
    // Очищаем список перед рендерингом
    listElement.innerHTML = '';
    
    // Добавляем каждую задачу в список
    items.forEach(item => {
        const newItem = createItem(item);
        listElement.append(newItem);
    });
    
    // Обновляем счетчик задач
    updateTasksCounter();
}

// Обработчик отправки формы
formElement.addEventListener('submit', (event) => {
    event.preventDefault(); // Отключаем перезагрузку страницы
    
    // Получаем текст из поля ввода и удаляем лишние пробелы
    const taskText = inputElement.value.trim();
    
    // Проверяем, что поле не пустое
    if (taskText === '') {
        // Добавляем анимацию ошибки
        inputElement.style.borderColor = '#ef4444';
        inputElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        setTimeout(() => {
            inputElement.style.borderColor = '#e5e7eb';
            inputElement.style.boxShadow = 'none';
        }, 1000);
        return;
    }
    
    // Создаем новую задачу и добавляем в начало списка
    const newItem = createItem(taskText);
    listElement.prepend(newItem);
    
    // Обновляем локальное хранилище
    const items = getTasksFromDOM();
    saveTasks(items);
    
    // Обновляем счетчик задач
    updateTasksCounter();
    
    // Очищаем поле ввода
    inputElement.value = '';
    inputElement.focus();
});

// Обработчик для кнопки "Очистить все"
clearAllButton.addEventListener('click', () => {
    if (listElement.children.length === 0) {
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить все задачи?')) {
        // Плавное удаление всех задач
        const items = Array.from(listElement.children);
        
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    item.remove();
                    
                    // Если это последний элемент, очищаем хранилище
                    if (index === items.length - 1) {
                        saveTasks([]);
                        updateTasksCounter();
                    }
                }, 300);
            }, index * 50); // Задержка для каскадного эффекта
        });
    }
});

// Обработчик для горячих клавиш
document.addEventListener('keydown', (event) => {
    // Ctrl+Enter или Cmd+Enter для добавления задачи
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (document.activeElement === inputElement) {
            formElement.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape для снятия фокуса
    if (event.key === 'Escape') {
        const editableElement = document.querySelector('[contenteditable="true"]');
        if (editableElement) {
            editableElement.blur();
        }
    }
});

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    inputElement.focus();
    
    // Показать подсказку о горячих клавишах
    setTimeout(() => {
        console.log('✨ Подсказка: Используйте Ctrl+Enter для быстрого добавления задач!');
    }, 1000);
});

// Стиль для выбранной задачи
const style = document.createElement('style');
style.textContent = `
    .to-do__item--selected {
        border-color: #3b82f6 !important;
        background: #eff6ff !important;
    }
    
    .to-do__item-text[contenteditable="true"] {
        background: white !important;
        border: 2px solid #4f46e5 !important;
        padding: 0.5rem !important;
        border-radius: 8px !important;
    }
`;
document.head.appendChild(style);

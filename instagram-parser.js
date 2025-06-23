// Instagram Parser для сайта вакансий Кызылорды

// Категории вакансий
const categories = {
    food: ['официант', 'бармен', 'повар', 'кондитер', 'бариста', 'кафе', 'ресторан', 'общепит'],
    retail: ['продавец', 'кассир', 'торговля', 'магазин', 'консультант', 'маркет'],
    office: ['офис', 'менеджер', 'администратор', 'бухгалтер', 'секретарь'],
    transport: ['водитель', 'курьер', 'доставка', 'такси', 'перевозки', 'логист'],
    other: ['другое']
};

// Индикатор загрузки
function showLoader(show, message = 'Загрузка...') {
    let loader = document.getElementById('loader');
    if (!loader && show) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        `;
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            border: 5px solid #f3f3f3;
            border-top: 5px solid #d4af37;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            margin: 0 auto 15px;
            animation: spin 2s linear infinite;
        `;
        
        const text = document.createElement('p');
        text.textContent = message;
        
        content.appendChild(spinner);
        content.appendChild(text);
        loader.appendChild(content);
        
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
        
        document.body.appendChild(loader);
    } else if (loader) {
        if (show) {
            const text = loader.querySelector('p');
            if (text) text.textContent = message;
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }
}

// Получение тестовых данных Instagram
function getMockPosts(username) {
    console.log(`Генерация тестовых постов для аккаунта @${username}`);
    return [
        {
            id: 'post1_' + new Date().getTime(),
            caption: `#вакансиякызылорда Требуется официант в ресторан "Золотой Дракон". Зарплата от 120 000 тг. Опыт работы от 1 года. Контакты: +7 (777) 111-22-33`,
            permalink: `https://instagram.com/p/test1_${username}`,
            timestamp: new Date().toISOString()
        },
        {
            id: 'post2_' + new Date().getTime(),
            caption: `Ищем водителя на доставку! #вакансиякызылорда #работа Требования: опыт вождения от 2 лет. Зарплата от 180 000 тг. Контакты: +7 (777) 444-55-66`,
            permalink: `https://instagram.com/p/test2_${username}`,
            timestamp: new Date().toISOString()
        },
        {
            id: 'post3_' + new Date().getTime(),
            caption: `Ищем продавца-консультанта в магазин электроники. График 5/2. ЗП от 130 000 тг. #вакансия #кызылорда #работа`,
            permalink: `https://instagram.com/p/test3_${username}`,
            timestamp: new Date().toISOString()
        },
        {
            id: 'post4_' + new Date().getTime(),
            caption: `Администратор в салон красоты! Зарплата 150000 тг. График 2/2. Опыт работы приветствуется. #вакансия #работа #кызылорда`,
            permalink: `https://instagram.com/p/test4_${username}`,
            timestamp: new Date().toISOString()
        },
        {
            id: 'post5_' + new Date().getTime(),
            caption: `#работа #вакансия Требуется бухгалтер в крупную компанию. Опыт работы от 3 лет. Зарплата от 200000 тг. Обращаться: 87771234567`,
            permalink: `https://instagram.com/p/test5_${username}`,
            timestamp: new Date().toISOString()
        }
    ];
}

// Анализ текста и извлечение информации о вакансии
function parseVacancy(post) {
    const text = post.caption || '';
    
    // Название вакансии
    let title = '';
    if (text.toLowerCase().includes('требуется')) {
        title = text.split('требуется')[1].split(/[.!?]/)[0].trim();
    } else if (text.toLowerCase().includes('ищем')) {
        title = text.split('ищем')[1].split(/[.!?]/)[0].trim();
    } else {
        title = text.split(/[.!?]/)[0].replace(/#\w+/g, '').trim();
    }
    
    // Зарплата
    let salary = 'Договорная';
    const salaryMatch = text.match(/(?:зарплата|зп|оплата|ЗП)[\s:]*(от)?\s*(\d+[\s\d]*(?:тыс|т|k|к|тг|тенге))/i);
    if (salaryMatch) {
        salary = `от ${salaryMatch[2]}`;
    }
    
    // Контакты
    let contacts = 'Указано в Instagram';
    const contactMatch = text.match(/(?:контакты|тел|звонить|обращаться)[^0-9]*([0-9+\-\(\)\s]{10,})/i);
    if (contactMatch) {
        contacts = contactMatch[1].trim();
    }
    
    // Компания
    let company = 'Работодатель из Instagram';
    const companyMatch = text.match(/(?:ресторан|кафе|компания|фирма|ТОО|ИП|салон|магазин)\s+["«]([^"»]+)["»]/i);
    if (companyMatch) {
        company = companyMatch[0].trim();
    }
    
    // Определение категории
    let category = 'other';
    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => text.toLowerCase().includes(kw))) {
            category = cat;
            break;
        }
    }
    
    // Формируем объект вакансии
    return {
        title: title || 'Новая вакансия',
        company: company,
        category: category,
        categoryName: getCategoryName(category),
        salary: salary,
        location: 'Кызылорда',
        description: text.substring(0, 300) + (text.length > 300 ? '...' : ''),
        requirements: '',
        contactInfo: contacts,
        instagramLink: post.permalink,
        postDate: post.timestamp
    };
}

// Получение названия категории
function getCategoryName(categoryId) {
    const names = {
        food: 'Общепит',
        retail: 'Торговля',
        office: 'Офисная работа',
        transport: 'Транспорт',
        other: 'Другое'
    };
    return names[categoryId] || 'Другое';
}

// Основная функция импорта
async function importFromInstagram(options) {
    try {
        const username = options.username || 'kyzylorda_jobs';
        const limit = options.limit || 10;
        const onlyWithHashtag = options.onlyWithHashtag !== undefined ? options.onlyWithHashtag : true;
        const clearHistory = options.clearHistory || false;
        
        showLoader(true, `Получение данных из Instagram для @${username}...`);
        
        // Имитация задержки сети
        await new Promise(r => setTimeout(r, 1000));
        
        // Получение постов
        const posts = getMockPosts(username);
        const limitedPosts = posts.slice(0, limit);
        
        // Получение текущих данных
        let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        let processedIds = JSON.parse(localStorage.getItem('processedPostIds')) || [];
        
        // Сброс истории, если требуется
        if (clearHistory) {
            processedIds = [];
        }
        
        showLoader(true, 'Обработка данных...');
        let newJobsCount = 0;
        
        // Обработка постов
        for (const post of limitedPosts) {
            // Пропускаем уже обработанные
            if (processedIds.includes(post.id) && !clearHistory) {
                continue;
            }
            
            // Проверка на хэштеги вакансий
            const hasVacancyTag = ['#вакансия', '#работа', '#вакансиякызылорда', '#работакызылорда'].some(
                tag => post.caption.toLowerCase().includes(tag)
            );
            
            if (onlyWithHashtag && !hasVacancyTag) {
                continue;
            }
            
            // Парсинг вакансии
            const vacancy = parseVacancy(post);
            
            // Генерация ID
            const maxId = jobs.length > 0 ? Math.max(...jobs.map(j => parseInt(j.id) || 0)) : 0;
            vacancy.id = maxId + 1;
            
            // Добавление вакансии
            jobs.push(vacancy);
            processedIds.push(post.id);
            newJobsCount++;
        }
        
        // Сохранение результатов
        showLoader(true, 'Сохранение данных...');
        localStorage.setItem('jobs', JSON.stringify(jobs));
        localStorage.setItem('processedPostIds', JSON.stringify(processedIds));
        
        // Обновление отображения
        if (typeof window.renderJobs === 'function') {
            window.renderJobs();
        }
        
        return newJobsCount;
    } catch (error) {
        console.error('Ошибка импорта:', error);
        return 0;
    } finally {
        showLoader(false);
    }
}

// Экспорт функции для вызова из админ-панели
window.manualUpdateVacancies = function(options = {}) {
    return importFromInstagram(options).then(count => {
        alert(`Импорт завершен. Добавлено ${count} новых вакансий.`);
        return count;
    });
};

// Функция сброса истории импорта
window.clearProcessedPosts = function() {
    localStorage.removeItem('processedPostIds');
    alert('История импорта очищена.');
};

// Функция для очистки всех вакансий
window.clearAllJobs = function() {
    localStorage.removeItem('jobs');
    localStorage.removeItem('processedPostIds');
    alert('Все вакансии успешно удалены. Обновите страницу, чтобы увидеть изменения.');
    if (typeof window.renderJobs === 'function') {
        window.renderJobs();
    }
};

// Функция для извлечения вакансий из текста Instagram постов
function extractVacancy(text) {
    // Создаем объект вакансии
    const vacancy = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: '',
        company: '',
        salary: '',
        location: 'Кызылорда',
        category: 'other',
        categoryName: 'Другое',
        description: '',
        requirements: '',
        contactInfo: '',
        postDate: new Date().toISOString()
    };
    
    // Регулярные выражения для извлечения информации
    const titleRegex = /(?:требуется|открыта вакансия|вакансия|ищем|нужен|нужна|требуются)(.*?)(?:\.|,|$)/i;
    const salaryRegex = /(?:зарплата|оплата|ставка|з\/п|до|от|с|оклад|начиная|заработная плата|сумма|тг|тенге)(?:[:\s]*)([\d\s.,]+)(?:тг|тенге|т|₸|руб|р|\$|₽)?/i;
    const contactRegex = /(?:тел|телефон|номер|контакты|связь|звонить|обращаться|ватсап|whatsapp|WhatsApp|WA)(?:[:\s]+)((?:\+7|8)?[\s\-(]?\d{3}[\s\-)]?[\d\s\-]{7,10})/i;
    const companyRegex = /(?:в|компания|компанию|организацию|фирму|организация|фирма|кафе|ресторан|гостиница|гостиницу|отель|магазин|организация|ТОО|ООО|ИП|салон)(.*?)(?:требуется|открыта вакансия|вакансия|ищем|нужен|нужна)/i;
    
    // Извлекаем название вакансии
    const titleMatch = text.match(titleRegex);
    if (titleMatch && titleMatch[1]) {
        vacancy.title = titleMatch[1].trim();
    } else {
        // Если не удалось найти название по шаблону, ищем ключевые слова
        const jobTitles = ['официант', 'бармен', 'повар', 'водитель', 'администратор', 'менеджер', 'продавец', 'кассир', 'охранник', 'грузчик', 'оператор', 'курьер', 'консультант', 'уборщица', 'помощник', 'дизайнер', 'механизатор', 'сварщик'];
        
        for (const title of jobTitles) {
            if (text.toLowerCase().includes(title)) {
                vacancy.title = title.charAt(0).toUpperCase() + title.slice(1);
                break;
            }
        }
        
        // Если всё еще не нашли, берём первые 30 символов текста
        if (!vacancy.title) {
            vacancy.title = text.slice(0, 30).trim() + '...';
        }
    }
    
    // Извлекаем зарплату
    const salaryMatch = text.match(salaryRegex);
    if (salaryMatch && salaryMatch[1]) {
        const salaryValue = salaryMatch[1].replace(/\s+/g, '').trim();
        
        // Если нашли число, форматируем его
        if (/\d+/.test(salaryValue)) {
            vacancy.salary = salaryValue + ' тг';
        }
    }
    
    // Если зарплата не найдена, но текст содержит числа, которые могут быть зарплатой
    if (!vacancy.salary) {
        const potentialSalaryMatch = text.match(/(\d{5,6})/); // 5-6 цифр подряд (типичная зарплата)
        if (potentialSalaryMatch) {
            vacancy.salary = potentialSalaryMatch[1] + ' тг';
        } else {
            vacancy.salary = 'По договоренности';
        }
    }
    
    // Извлекаем контактную информацию
    const contactMatch = text.match(contactRegex);
    if (contactMatch && contactMatch[1]) {
        vacancy.contactInfo = contactMatch[1].trim();
    } else {
        // Ищем просто номер телефона в формате +7 или 8 с 10 цифрами
        const phoneMatch = text.match(/(?:\+7|8)[(\s-]?\d{3}[)\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/);
        if (phoneMatch) {
            vacancy.contactInfo = phoneMatch[0].trim();
        }
    }
    
    // Извлекаем название компании
    const companyMatch = text.match(companyRegex);
    if (companyMatch && companyMatch[1]) {
        vacancy.company = companyMatch[1].trim();
    } else if (text.includes('ТОО') || text.includes('ООО') || text.includes('ИП')) {
        // Ищем после ТОО, ООО или ИП
        const companyEntityMatch = text.match(/(?:ТОО|ООО|ИП)\s+"?([^"]+)"?/);
        if (companyEntityMatch && companyEntityMatch[1]) {
            vacancy.company = companyEntityMatch[1].trim();
        }
    }
    
    // Если компания всё еще не найдена
    if (!vacancy.company) {
        // Ищем типичные места работы
        const workplaces = ['кафе', 'ресторан', 'гостиница', 'отель', 'магазин', 'салон', 'клиника', 'завод', 'фабрика'];
        for (const workplace of workplaces) {
            if (text.toLowerCase().includes(workplace)) {
                const workplaceIndex = text.toLowerCase().indexOf(workplace);
                const potentialCompany = text.slice(workplaceIndex, workplaceIndex + 30).split(/[.,;]/)[0];
                vacancy.company = potentialCompany.trim();
                break;
            }
        }
    }
    
    // Если компания всё еще не найдена
    if (!vacancy.company || vacancy.company.length < 3) {
        vacancy.company = 'Компания в Кызылорде';
    }
    
    // Определяем категорию на основе ключевых слов
    const categoryKeywords = {
        food: ['кафе', 'ресторан', 'бар', 'общепит', 'официант', 'повар', 'пиццер', 'кух', 'бармен', 'пекарь', 'кондитер'],
        retail: ['продавец', 'консультант', 'магазин', 'кассир', 'торгов', 'продаж'],
        office: ['офис', 'менеджер', 'администратор', 'секретарь', 'делопроизвод', 'бухгалтер', 'юрист'],
        transport: ['водитель', 'перевозк', 'такси', 'доставка', 'курьер', 'механизатор'],
        construction: ['строитель', 'мастер', 'сварщик', 'слесарь', 'монтаж', 'ремонт'],
        education: ['учитель', 'преподава', 'репетитор', 'воспитатель', 'образован'],
        medical: ['медсестра', 'врач', 'клиник', 'медицин', 'фармацевт', 'аптек']
    };
    
    let foundCategory = false;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (text.toLowerCase().includes(keyword.toLowerCase()) || 
                (vacancy.title && vacancy.title.toLowerCase().includes(keyword.toLowerCase())) || 
                (vacancy.company && vacancy.company.toLowerCase().includes(keyword.toLowerCase()))) {
                vacancy.category = category;
                foundCategory = true;
                break;
            }
        }
        if (foundCategory) break;
    }
    
    // Устанавливаем название категории
    const categoryNames = {
        food: 'Общепит',
        retail: 'Торговля',
        office: 'Офисная работа',
        transport: 'Транспорт',
        construction: 'Строительство',
        education: 'Образование',
        medical: 'Медицина',
        other: 'Другое'
    };
    vacancy.categoryName = categoryNames[vacancy.category];
    
    // Устанавливаем описание - первые 100 символов текста или весь текст, если он меньше
    vacancy.description = text.length > 100 ? text.slice(0, 100) + '...' : text;
    
    // Ищем требования - обычно после слов "требования", "требуется", "нужно", "необходимо"
    const requirementsRegex = /(?:требования|требуется|нужно|необходимо|условия|ищем|с опытом)(?::[.\s]*)([^.]*)(?:\.|\n|$)/i;
    const reqMatch = text.match(requirementsRegex);
    if (reqMatch && reqMatch[1]) {
        vacancy.requirements = reqMatch[1].trim();
    }
    
    return vacancy;
}

// Функция для извлечения вакансий из текста изображения
function extractVacancies(text) {
    // Проверяем, есть ли в тексте ключевые слова, указывающие на вакансию
    const keywords = ['требуется', 'работа', 'вакансия', 'нужен', 'нужна', 'требуются', 'ищем', 'работу', 'зарплата', 'з/п', 'оклад'];
    const hasKeywords = keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
    
    if (!hasKeywords) {
        return []; // Если нет ключевых слов, считаем, что это не вакансия
    }
    
    // Создаем вакансию из текста
    const vacancy = extractVacancy(text);
    return [vacancy];
}

// Имитация процесса импорта из Instagram
async function manualUpdateVacancies(options) {
    console.log("Начинаем импорт вакансий из Instagram...");
    
    // Показываем индикатор загрузки
    showLoader(true, "Импортируем вакансии из Instagram...");
    
    // Небольшая задержка для имитации загрузки
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Пример текстов из Instagram постов (имитация данных с фотографий)
    const instagramPosts = [
        "В кафе \"Сыр-Сулуы\" требуется Официант - девушка, 25-35 лет. Энергичная, коммуникабельная, свободно владеющая казахским и русским языком. Режим работы с 15:00 - 03:00 часов, посменно. Тел: 87779223572.",
        "Также в гостиницу \"Турист\" администратор. Женщина 30-45 лет, свободно владеющая казахским и русским языком. Со знанием компьютера и 1С. Ответственная, коммуникабельная, умеющая работать в команде. График работы сутки/сутки. Обращаться после 16:00 по адресу Ауелбекова 31.",
        "Кажет! Даршы (официанты) Еден жуушы (техничка) Жаман ас үстершы әйбеккөр өз жұмысын білетіндер. 21:00-ге дейін қоңырау шалыңыз. Тел: 8701 559 55 09",
        "В нашу команду требуется: Пиццеры с опытом работы. З/п ежедневная. Пишите в whatsApp 87770717700 Адрес: Сужикова 1.",
        "Курылыс дүкеніне груэчиктер керек жас аралыгы 18-35. Айлык күнделікті 6000 тг плюс обед. Жумыс уакыты 8.30-19.30 Адрес: Кизатова 2А тел:87779223572.",
        "\"Алтын орда\" мекемесіне қабылдаймыз: - Е категориясы бар жүргізушілер 15/15 айлық 200 000 теңге - Д категориясы бар жүргізушілер айлық 150 000 теңге - Сварщик 6/1 айлық 250 000 теңге - Механизатор грейдерист 15/15 айлық 200 000 теңге - Механизатор погрузчик 15/15 айлық 200 000 теңге. Байланыс номері 8705 825 80 04 или 8707 797 45 53"
    ];
    
    // Получаем существующие вакансии
    let jobs = [];
    try {
        const existingJobs = localStorage.getItem('jobs');
        if (existingJobs) {
            jobs = JSON.parse(existingJobs);
        }
    } catch (error) {
        console.error("Ошибка при получении существующих вакансий:", error);
        jobs = [];
    }
    
    // Если выбрана опция очистки истории, удаляем все вакансии с пометкой из Instagram
    if (options && options.clearHistory) {
        jobs = jobs.filter(job => !job.fromInstagram);
    }
    
    // Создаем напрямую новые вакансии из примеров постов
    const newVacancies = [
        {
            id: Date.now() + 1,
            title: 'Официант',
            company: 'Кафе "Сыр-Сулуы"',
            salary: 'По договоренности',
            location: 'Кызылорда',
            category: 'food',
            categoryName: 'Общепит',
            description: 'В кафе "Сыр-Сулуы" требуется Официант - девушка, 25-35 лет. Энергичная, коммуникабельная, свободно владеющая казахским и русским языком.',
            requirements: 'Возраст 25-35 лет, знание казахского и русского языка',
            contactInfo: '87779223572',
            fromInstagram: true,
            postDate: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            title: 'Администратор',
            company: 'Гостиница "Турист"',
            salary: 'По договоренности',
            location: 'Кызылорда',
            category: 'office',
            categoryName: 'Офисная работа',
            description: 'В гостиницу "Турист" требуется администратор. Женщина 30-45 лет, свободно владеющая казахским и русским языком.',
            requirements: 'Со знанием компьютера и 1С. Ответственная, коммуникабельная, умеющая работать в команде.',
            contactInfo: 'Обращаться после 16:00 по адресу Ауелбекова 31',
            fromInstagram: true,
            postDate: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            title: 'Официанты и техничка',
            company: 'Кафе в Кызылорде',
            salary: 'По договоренности',
            location: 'Кызылорда',
            category: 'food',
            categoryName: 'Общепит',
            description: 'Кажет! Даршы (официанты) Еден жуушы (техничка) Жаман ас үстершы әйбеккөр өз жұмысын білетіндер.',
            requirements: 'Необходимо знать свою работу',
            contactInfo: '8701 559 55 09',
            fromInstagram: true,
            postDate: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            title: 'Пиццеры',
            company: 'Компания в Кызылорде',
            salary: 'Ежедневная оплата',
            location: 'Кызылорда, Сужикова 1',
            category: 'food',
            categoryName: 'Общепит',
            description: 'В нашу команду требуется: Пиццеры с опытом работы. З/п ежедневная.',
            requirements: 'С опытом работы',
            contactInfo: '87770717700 (WhatsApp)',
            fromInstagram: true,
            postDate: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            title: 'Грузчик',
            company: 'Строительный магазин',
            salary: '6000 тг в день',
            location: 'Кызылорда, Кизатова 2А',
            category: 'transport',
            categoryName: 'Транспорт',
            description: 'Курылыс дүкеніне груэчиктер керек жас аралыгы 18-35. Айлык күнделікті 6000 тг плюс обед.',
            requirements: 'Возраст 18-35 лет',
            contactInfo: '87779223572',
            fromInstagram: true,
            postDate: new Date().toISOString()
        },
        {
            id: Date.now() + 6,
            title: 'Водители и механизаторы',
            company: 'Алтын орда',
            salary: '150 000 - 250 000 тг',
            location: 'Кызылорда',
            category: 'transport',
            categoryName: 'Транспорт',
            description: '"Алтын орда" мекемесіне қабылдаймыз: - Е категориясы бар жүргізушілер 15/15 айлық 200 000 теңге ...',
            requirements: 'Наличие категорий Е, Д. Опыт работы',
            contactInfo: '8705 825 80 04, 8707 797 45 53',
            fromInstagram: true,
            postDate: new Date().toISOString()
        }
    ];
    
    // Добавляем новые вакансии в список
    for (const vacancy of newVacancies) {
        jobs.push(vacancy);
    }
    
    // Сохраняем обновленный список вакансий
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    // Скрываем индикатор загрузки
    showLoader(false);
    
    console.log(`Импорт завершен. Добавлено ${newVacancies.length} вакансий.`);
    
    // Обновляем отображение, если функция существует
    if (typeof window.renderJobs === 'function') {
        window.renderJobs();
    }
    
    return newVacancies.length;
}

// Функция для очистки всех вакансий
function clearAllJobs() {
    localStorage.removeItem('jobs');
    console.log("Все вакансии удалены");
    alert("Все вакансии успешно удалены");
}

// Экспортируем функции
window.manualUpdateVacancies = manualUpdateVacancies;
window.clearAllJobs = clearAllJobs;

console.log('Instagram Parser загружен успешно'); 
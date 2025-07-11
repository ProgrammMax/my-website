// Глобальные переменные
let allJobs = [];
let filteredJobs = [];
let currentCategory = 'all';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Основная функция инициализации
async function initializeApp() {
    // Обновляем год в футере
    updateCurrentYear();
    
    // Загружаем данные о вакансиях
    await loadJobsData();
    
    // Инициализируем обработчики событий
    initializeEventListeners();
    
    // Отображаем начальные вакансии
    displayRecentJobs();
    
    // Инициализируем другие компоненты
    initializeComponents();
}

// Загрузка данных о вакансиях
async function loadJobsData() {
    try {
        const response = await fetch('jobs-data.json');
        const data = await response.json();
        allJobs = data.jobs;
        filteredJobs = [...allJobs];
        
        console.log('Загружено вакансий:', allJobs.length);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Показываем сообщение об ошибке пользователю
        showErrorMessage('Не удалось загрузить вакансии. Попробуйте обновить страницу.');
    }
}

// Инициализация обработчиков событий
function initializeEventListeners() {
    // Поиск вакансий
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (searchInput && searchButton) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Категории вакансий
    const categoryLinks = document.querySelectorAll('.category-card .btn');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryId = this.href.split('id=')[1];
            filterByCategory(categoryId);
        });
    });
}

// Функция поиска с задержкой (debounce)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Обработка поиска
function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        filteredJobs = [...allJobs];
    } else {
        filteredJobs = allJobs.filter(job => 
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );
    }
    
    displayJobResults();
    
    // Добавляем эффект для кнопки поиска
    const searchButton = document.querySelector('.search-button');
    searchButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        searchButton.style.transform = 'scale(1)';
    }, 150);
}

// Фильтрация по категории
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    if (categoryId === 'all') {
        filteredJobs = [...allJobs];
    } else {
        filteredJobs = allJobs.filter(job => job.category === categoryId);
    }
    
    displayJobResults();
}

// Отображение свежих вакансий на главной странице
function displayRecentJobs() {
    const container = document.getElementById('recent-jobs-container');
    if (!container) return;
    
    // Получаем последние 6 вакансий
    const recentJobs = allJobs
        .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
        .slice(0, 6);
    
    container.innerHTML = '';
    
    if (recentJobs.length === 0) {
        container.innerHTML = '<p class="no-jobs">Вакансии не найдены</p>';
        return;
    }
    
    recentJobs.forEach(job => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
    });
}

// Отображение результатов поиска/фильтрации
function displayJobResults() {
    const container = document.getElementById('recent-jobs-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredJobs.length === 0) {
        container.innerHTML = '<p class="no-jobs">По вашему запросу вакансии не найдены</p>';
        return;
    }
    
    // Сначала показываем рекомендуемые вакансии
    const featuredJobs = filteredJobs.filter(job => job.featured);
    const regularJobs = filteredJobs.filter(job => !job.featured);
    
    [...featuredJobs, ...regularJobs].forEach(job => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
    });
    
    // Добавляем анимацию появления
    const jobCards = container.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Создание карточки вакансии
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    if (job.featured) {
        card.classList.add('featured');
    }
    
    const isFavorite = favorites.includes(job.id);
    const favoriteClass = isFavorite ? 'favorite active' : 'favorite';
    
    card.innerHTML = `
        <div class="job-header">
            <h3>${job.title}</h3>
            <div class="job-actions">
                <span class="job-salary">${job.salary}</span>
                <button class="${favoriteClass}" onclick="toggleFavorite(${job.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
        <div class="job-company">${job.company}</div>
        <div class="job-description">${job.description}</div>
        <div class="job-requirements">
            <strong>Требования:</strong>
            <ul>
                ${job.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        </div>
        <div class="job-footer">
            <div class="job-location">
                <i class="fas fa-map-marker-alt"></i>
                ${job.location}
            </div>
            <div class="job-date">
                ${formatDate(job.datePosted)}
            </div>
        </div>
        <div class="job-contact">
            <button class="btn btn-small" onclick="showContactInfo(${job.id})">
                Связаться с работодателем
            </button>
        </div>
    `;
    
    return card;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Вчера';
    } else if (diffDays <= 7) {
        return `${diffDays} дн. назад`;
    } else {
        return date.toLocaleDateString('ru-RU');
    }
}

// Переключение избранного
function toggleFavorite(jobId) {
    const index = favorites.indexOf(jobId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(jobId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Обновляем визуальное состояние кнопки
    const favoriteBtn = document.querySelector(`[onclick="toggleFavorite(${jobId})"]`);
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
    }
    
    // Обновляем счетчик в навигации
    updateNavigationFavoritesCount();
    
    // Показываем уведомление
    const job = allJobs.find(j => j.id === jobId);
    const message = favorites.includes(jobId) 
        ? `Вакансия "${job.title}" добавлена в избранное`
        : `Вакансия "${job.title}" удалена из избранного`;
    
    showNotification(message);
}

// Показ контактной информации
function showContactInfo(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;
    
    const modal = createModal(`
        <h3>Контактная информация</h3>
        <div class="contact-info">
            <h4>${job.title}</h4>
            <p><strong>Компания:</strong> ${job.company}</p>
            <p><strong>Телефон:</strong> <a href="tel:${job.contact.phone}">${job.contact.phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${job.contact.email}">${job.contact.email}</a></p>
        </div>
        <div class="modal-actions">
            <button class="btn" onclick="closeModal()">Закрыть</button>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// Создание модального окна
function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            ${content}
        </div>
    `;
    
    // Закрытие по клику на фон
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

// Закрытие модального окна
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Закрытие по клику
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Показ сообщения об ошибке
function showErrorMessage(message) {
    const container = document.getElementById('recent-jobs-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Обновление текущего года в футере
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Инициализация дополнительных компонентов
function initializeComponents() {
    // Обновляем счетчик избранных в навигации
    updateNavigationFavoritesCount();
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Эффект появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Наблюдаем за секциями
    document.querySelectorAll('.categories, .recent-jobs, .features').forEach(section => {
        observer.observe(section);
    });
}

// Обновление счетчика избранных в навигации
function updateNavigationFavoritesCount() {
    const badge = document.getElementById('nav-favorites-count');
    if (badge) {
        if (favorites.length > 0) {
            badge.textContent = favorites.length;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Статистика для отладки
function getStats() {
    return {
        totalJobs: allJobs.length,
        filteredJobs: filteredJobs.length,
        favorites: favorites.length,
        categories: [...new Set(allJobs.map(job => job.category))].length
    };
}

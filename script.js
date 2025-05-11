// Простой JavaScript для добавления интерактивности

// Функция, которая выполняется после полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем текущий год в футер
    const footerYear = document.querySelector('footer p');
    const currentYear = new Date().getFullYear();
    if (footerYear) {
        footerYear.textContent = footerYear.textContent.replace('2023', currentYear);
    }
    
    // Добавляем простую анимацию для заголовка
    const mainHeader = document.querySelector('h1');
    if (mainHeader) {
        mainHeader.style.transition = 'color 0.5s';
        mainHeader.addEventListener('mouseover', function() {
            this.style.color = '#0066cc';
        });
        mainHeader.addEventListener('mouseout', function() {
            this.style.color = '#4a4a4a';
        });
    }
    
    // Выводим приветственное сообщение в консоль
    console.log('Сайт успешно загружен!');
});

// Функционал для сайта вакансий

document.addEventListener('DOMContentLoaded', function() {
    // Обновляем год в футере
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Анимация для элементов при прокрутке
    const animateElements = document.querySelectorAll('.category-card, .job-card');
    
    if ('IntersectionObserver' in window) {
        const appearOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, {threshold: 0.1});
        
        animateElements.forEach(element => {
            element.classList.add('hidden-element');
            appearOnScroll.observe(element);
        });
    }
    
    // Функциональность поиска
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            if (searchInput.value.trim() !== '') {
                performSearch(searchInput.value.trim());
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                performSearch(searchInput.value.trim());
            }
        });
    }
    
    // Подсветка активной вкладки в меню
    highlightActiveMenuItem();
    
    // Инициализация анимаций для хедера
    initHeaderAnimation();
    
    // Инициализация обработчиков для категорий
    initCategoryClickHandlers();
    
    console.log('Портал вакансий Кызылорды готов к работе!');
});

// Имитация функции поиска (в реальном проекте здесь будет отправка запроса на сервер)
function performSearch(query) {
    console.log('Поиск вакансий по запросу: ' + query);
    
    // Демонстрационная функция - в реальном проекте здесь был бы редирект на страницу результатов
    alert('Поиск по запросу: "' + query + '"\n\nВ полноценной версии здесь будет переход на страницу результатов поиска.');
}

// Подсветка активного пункта меню
function highlightActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const menuLinks = document.querySelectorAll('nav ul li a');
    
    menuLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active-menu-item');
        }
    });
}

// Анимация для хедера при прокрутке
function initHeaderAnimation() {
    const header = document.querySelector('header');
    const headerContent = document.querySelector('.header-content');
    
    if (header && headerContent) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
                headerContent.classList.add('header-content-scrolled');
            } else {
                header.classList.remove('header-scrolled');
                headerContent.classList.remove('header-content-scrolled');
            }
        });
    }
}

// Обработчики нажатий на категории
function initCategoryClickHandlers() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        const link = card.querySelector('a.btn');
        
        // Делаем всю карточку кликабельной
        card.addEventListener('click', function(e) {
            if (e.target !== link) {
                e.preventDefault();
                if (link) {
                    link.click();
                }
            }
        });
    });
}

// Добавляем CSS-стили для анимаций
const animationStyles = `
.hidden-element {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.show {
    opacity: 1;
    transform: translateY(0);
}

.header-scrolled {
    padding: 15px 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.header-content-scrolled h1 {
    font-size: 2.2rem;
    transition: all 0.3s ease;
}

.active-menu-item {
    color: #d4af37 !important;
    font-weight: bold;
    border-bottom: 2px solid #d4af37;
}
`;

// Добавляем стили на страницу
const styleElement = document.createElement('style');
styleElement.textContent = animationStyles;
document.head.appendChild(styleElement); 
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
// Специальный JavaScript для страницы избранных вакансий

document.addEventListener('DOMContentLoaded', function() {
    initializeFavoritesPage();
});

// Инициализация страницы избранных
async function initializeFavoritesPage() {
    // Обновляем год в футере
    updateCurrentYear();
    
    // Загружаем данные о вакансиях
    await loadJobsData();
    
    // Отображаем избранные вакансии
    displayFavoriteJobs();
    
    // Обновляем счетчик
    updateFavoritesCount();
}

// Отображение избранных вакансий
function displayFavoriteJobs() {
    const container = document.getElementById('favorites-container');
    const emptyState = document.getElementById('empty-favorites');
    
    if (!container || !emptyState) return;
    
    const favoriteJobs = allJobs.filter(job => favorites.includes(job.id));
    
    container.innerHTML = '';
    
    if (favoriteJobs.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Сортируем по дате добавления в избранное (новые сначала)
    favoriteJobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobCard.classList.add('favorite-job-card');
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

// Обновление счетчика избранных
function updateFavoritesCount() {
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
        countElement.textContent = favorites.length;
    }
}

// Очистка всех избранных вакансий
function clearAllFavorites() {
    if (favorites.length === 0) {
        showNotification('Список избранных уже пуст', 'info');
        return;
    }
    
    const modal = createConfirmationModal(
        'Удалить все избранные вакансии?',
        'Это действие нельзя отменить. Все сохраненные вакансии будут удалены.',
        function() {
            favorites = [];
            localStorage.setItem('favorites', JSON.stringify(favorites));
            displayFavoriteJobs();
            updateFavoritesCount();
            showNotification('Все избранные вакансии удалены', 'success');
            closeModal();
        }
    );
    
    document.body.appendChild(modal);
}

// Экспорт избранных вакансий
function exportFavorites() {
    if (favorites.length === 0) {
        showNotification('Нет избранных вакансий для экспорта', 'info');
        return;
    }
    
    const favoriteJobs = allJobs.filter(job => favorites.includes(job.id));
    
    // Создаем текстовый файл с данными
    let exportText = 'ИЗБРАННЫЕ ВАКАНСИИ\n';
    exportText += '===================\n\n';
    
    favoriteJobs.forEach((job, index) => {
        exportText += `${index + 1}. ${job.title}\n`;
        exportText += `   Компания: ${job.company}\n`;
        exportText += `   Зарплата: ${job.salary}\n`;
        exportText += `   Местоположение: ${job.location}\n`;
        exportText += `   Описание: ${job.description}\n`;
        exportText += `   Требования: ${job.requirements.join(', ')}\n`;
        exportText += `   Телефон: ${job.contact.phone}\n`;
        exportText += `   Email: ${job.contact.email}\n`;
        exportText += `   Дата публикации: ${formatDate(job.datePosted)}\n`;
        exportText += '\n' + '-'.repeat(50) + '\n\n';
    });
    
    exportText += `Экспортировано: ${new Date().toLocaleDateString('ru-RU')} в ${new Date().toLocaleTimeString('ru-RU')}\n`;
    exportText += 'Источник: Вакансии Кызылорды (kyzylorda-jobs.kz)';
    
    // Создаем и скачиваем файл
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `избранные_вакансии_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification(`Экспортировано ${favoriteJobs.length} вакансий`, 'success');
}

// Создание модального окна подтверждения
function createConfirmationModal(title, message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content confirmation-modal">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            <div class="confirmation-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn btn-cancel" onclick="closeModal()">Отмена</button>
                <button class="btn btn-confirm" id="confirm-action">Подтвердить</button>
            </div>
        </div>
    `;
    
    // Обработчик подтверждения
    modal.querySelector('#confirm-action').addEventListener('click', onConfirm);
    
    // Закрытие по клику на фон
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            if (onCancel) onCancel();
            closeModal();
        }
    });
    
    return modal;
}

// Переопределяем функцию toggleFavorite для обновления страницы
function toggleFavoriteOnPage(jobId) {
    toggleFavorite(jobId);
    
    // Задержка для плавности анимации
    setTimeout(() => {
        displayFavoriteJobs();
        updateFavoritesCount();
    }, 300);
}

// Добавляем кнопку "Поделиться избранным"
function shareFavorites() {
    if (favorites.length === 0) {
        showNotification('Нет избранных вакансий для отправки', 'info');
        return;
    }
    
    const favoriteJobs = allJobs.filter(job => favorites.includes(job.id));
    const jobTitles = favoriteJobs.map(job => job.title).join(', ');
    
    const shareText = `Мои избранные вакансии в Кызылорде:\n${jobTitles}\n\nПодробнее на: ${window.location.origin}`;
    
    if (navigator.share) {
        // Используем Web Share API если доступен
        navigator.share({
            title: 'Избранные вакансии',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Ошибка при попытке поделиться:', err));
    } else {
        // Fallback - копируем в буфер обмена
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Ссылка скопирована в буфер обмена', 'success');
        }).catch(() => {
            showNotification('Не удалось скопировать ссылку', 'error');
        });
    }
}

// Добавляем кнопки в избранные карточки с дополнительными действиями
function createFavoriteJobCard(job) {
    const card = createJobCard(job);
    
    // Добавляем дополнительные кнопки
    const additionalActions = document.createElement('div');
    additionalActions.className = 'favorite-additional-actions';
    additionalActions.innerHTML = `
        <button class="btn btn-small btn-outline" onclick="removeFromFavorites(${job.id})">
            <i class="fas fa-times"></i> Удалить из избранного
        </button>
    `;
    
    card.appendChild(additionalActions);
    return card;
}

// Удаление конкретной вакансии из избранного
function removeFromFavorites(jobId) {
    toggleFavorite(jobId);
    displayFavoriteJobs();
    updateFavoritesCount();
    
    const job = allJobs.find(j => j.id === jobId);
    if (job) {
        showNotification(`Вакансия "${job.title}" удалена из избранного`, 'info');
    }
}

// Добавляем статистику избранных
function getFavoritesStats() {
    const favoriteJobs = allJobs.filter(job => favorites.includes(job.id));
    const categories = {};
    const companies = {};
    
    favoriteJobs.forEach(job => {
        categories[job.category] = (categories[job.category] || 0) + 1;
        companies[job.company] = (companies[job.company] || 0) + 1;
    });
    
    return {
        total: favoriteJobs.length,
        categories: categories,
        companies: companies,
        topCategory: Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, ''),
        topCompany: Object.keys(companies).reduce((a, b) => companies[a] > companies[b] ? a : b, '')
    };
} 
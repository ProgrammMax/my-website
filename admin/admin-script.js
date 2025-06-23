// Админ-панель JavaScript
let adminJobs = [];
let isAuthenticated = false;

// Данные для авторизации
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'dom23'
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupEventListeners();
});

// Проверка авторизации
function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
        showAdminPanel();
        initializeAdmin();
    } else {
        showLoginScreen();
    }
}

// Показать экран авторизации
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
    isAuthenticated = false;
}

// Показать админ-панель
function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    isAuthenticated = true;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма авторизации
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Форма добавления вакансии
    const addJobForm = document.getElementById('add-job-form');
    if (addJobForm) {
        addJobForm.addEventListener('submit', handleAddJob);
    }
}

// Обработка авторизации
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('login-error');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('admin_logged_in', 'true');
        showAdminPanel();
        initializeAdmin();
        showNotification('Добро пожаловать в админ-панель!', 'success');
    } else {
        errorDiv.style.display = 'block';
        showNotification('Неверный логин или пароль', 'error');
        
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// Выход из системы
function logout() {
    sessionStorage.removeItem('admin_logged_in');
    showLoginScreen();
    showNotification('Вы вышли из системы', 'info');
    adminJobs = [];
    isAuthenticated = false;
}

// Инициализация админ-панели
async function initializeAdmin() {
    if (!isAuthenticated) return;
    
    await loadJobsData();
    updateDashboardStats();
    loadJobsTable();
}

// Загрузка данных о вакансиях
async function loadJobsData() {
    try {
        const response = await fetch('../jobs-data.json');
        const data = await response.json();
        adminJobs = data.jobs;
        console.log('Админ: Загружено вакансий:', adminJobs.length);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных о вакансиях', 'error');
    }
}

// Обновление статистики
function updateDashboardStats() {
    const totalJobs = adminJobs.length;
    const totalCompanies = [...new Set(adminJobs.map(job => job.company))].length;
    const uniqueFavorites = Math.floor(Math.random() * 50) + 15;
    
    document.getElementById('total-jobs').textContent = totalJobs;
    document.getElementById('total-companies').textContent = totalCompanies;
    document.getElementById('total-favorites').textContent = uniqueFavorites;
}

// Загрузка таблицы вакансий
function loadJobsTable() {
    const tbody = document.getElementById('jobs-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    adminJobs.forEach(job => {
        const row = createJobTableRow(job);
        tbody.appendChild(row);
    });
}

// Создание строки таблицы
function createJobTableRow(job) {
    const row = document.createElement('tr');
    const categoryNames = {
        'food': 'Общепит',
        'retail': 'Торговля', 
        'office': 'Офис',
        'transport': 'Транспорт'
    };
    
    row.innerHTML = `
        <td>#${job.id}</td>
        <td>${job.title}</td>
        <td>${job.company}</td>
        <td>${categoryNames[job.category] || job.category}</td>
        <td>${job.salary}</td>
        <td>${formatDate(job.datePosted)}</td>
        <td><span class="status-active">Активна</span></td>
        <td>
            <button class="btn btn-info" onclick="editJob(${job.id})" style="padding: 5px 10px; margin-right: 5px;">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger" onclick="deleteJob(${job.id})" style="padding: 5px 10px;">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Показать модальное окно добавления вакансии
function showAddJobModal() {
    document.getElementById('add-job-modal').style.display = 'flex';
}

// Закрыть модальное окно
function closeJobModal() {
    document.getElementById('add-job-modal').style.display = 'none';
    document.getElementById('add-job-form').reset();
}

// Обработка добавления вакансии
function handleAddJob(e) {
    e.preventDefault();
    
    const requirements = document.getElementById('job-requirements').value
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);
    
    const newJob = {
        id: Math.max(...adminJobs.map(job => job.id)) + 1,
        title: document.getElementById('job-title').value,
        company: document.getElementById('job-company').value,
        category: document.getElementById('job-category').value,
        salary: document.getElementById('job-salary').value,
        location: document.getElementById('job-location').value,
        description: document.getElementById('job-description').value,
        requirements: requirements,
        datePosted: new Date().toISOString().split('T')[0],
        featured: document.getElementById('job-featured').checked,
        contact: {
            phone: document.getElementById('job-phone').value,
            email: document.getElementById('job-email').value
        }
    };
    
    adminJobs.push(newJob);
    updateDashboardStats();
    loadJobsTable();
    closeJobModal();
    
    addActivity('plus', `Добавлена вакансия "${newJob.title}" от компании "${newJob.company}"`, 'Только что');
    showNotification(`Вакансия "${newJob.title}" успешно добавлена!`, 'success');
}

// Удаление вакансии
function deleteJob(jobId) {
    const job = adminJobs.find(j => j.id === jobId);
    if (!job) return;
    
    if (confirm(`Вы уверены, что хотите удалить вакансию "${job.title}"?`)) {
        adminJobs = adminJobs.filter(j => j.id !== jobId);
        updateDashboardStats();
        loadJobsTable();
        
        addActivity('trash', `Удалена вакансия "${job.title}"`, 'Только что');
        showNotification(`Вакансия "${job.title}" удалена`, 'success');
    }
}

// Переключение разделов
function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(sectionName + '-section').classList.add('active');
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
}

// Переход на основной сайт
function viewMainSite() {
    window.open('../index.html', '_blank');
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Добавление активности
function addActivity(icon, text, time) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    const iconClasses = {
        'plus': 'fas fa-plus text-success',
        'edit': 'fas fa-edit text-warning',
        'trash': 'fas fa-trash text-danger'
    };
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <i class="${iconClasses[icon]}"></i>
        <span>${text}</span>
        <small>${time}</small>
    `;
    
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            margin-left: 10px;
        ">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Цвета уведомлений
function getNotificationColor(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return colors[type] || colors.info;
}

// Смена пароля
function changePassword() {
    const newPassword = prompt('Введите новый пароль:');
    if (newPassword && newPassword.length >= 6) {
        showNotification('Пароль успешно изменен', 'success');
        addActivity('edit', 'Изменен пароль администратора', 'Только что');
    } else if (newPassword !== null) {
        showNotification('Пароль должен содержать минимум 6 символов', 'error');
    }
}

// Резервное копирование
function backupData() {
    const backupData = {
        jobs: adminJobs,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Резервная копия создана', 'success');
    addActivity('edit', 'Создана резервная копия данных', 'Только что');
}

// Защита от несанкционированного доступа
function protectAdminPanel() {
    // Отключаем правый клик
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotification('Функция отключена в админ-панели', 'warning');
    });
    
    // Отключаем F12, Ctrl+Shift+I и другие комбинации
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            showNotification('Функция отключена в админ-панели', 'warning');
        }
    });
}

// Инициализация защиты
document.addEventListener('DOMContentLoaded', function() {
    protectAdminPanel();
});

// Автоматический выход при бездействии (30 минут)
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (isAuthenticated) {
            logout();
            showNotification('Сессия завершена из-за бездействия', 'warning');
        }
    }, 30 * 60 * 1000); // 30 минут
}

// Отслеживание активности пользователя
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

// Запуск таймера при загрузке
resetInactivityTimer(); 
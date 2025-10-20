let tasks = JSON.parse(localStorage.getItem('sma-tasks')) || [];
let currentFilter = 'all';
let darkMode = localStorage.getItem('dark-mode') === 'true';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateThemeToggle();
    }
    renderTasks();
    updateStats();
});

function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', darkMode);
    updateThemeToggle();
}

function updateThemeToggle() {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (darkMode) {
        icon.textContent = '☀️';
        text.textContent = 'Light Mode';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Dark Mode';
    }
}

function toggleTaskForm() {
    const form = document.getElementById('task-form');
    form.classList.toggle('active');
    if (form.classList.contains('active')) {
        document.getElementById('task-title').focus();
    }
}

function addTask(event) {
    event.preventDefault();
    
    const task = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-deadline').value,
        subject: document.getElementById('task-subject').value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStats();
    
    // Reset form
    event.target.reset();
    toggleTaskForm();
    
    // Show success animation
    showNotification('Tugas berhasil ditambahkan! 🎉');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
        
        if (task.completed) {
            showNotification('Tugas selesai! 🎊');
        }
    }
}

function deleteTask(id) {
    if (confirm('Apakah kamu yakin ingin menghapus tugas ini?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
        showNotification('Tugas berhasil dihapus! 🗑️');
    }
}

function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'pending':
            return tasks.filter(t => !t.completed);
        case 'high':
            return tasks.filter(t => t.priority === 'high');
        default:
            return tasks;
    }
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>🎉 Tidak ada tugas!</h3>
                <p>${currentFilter === 'all' ? 'Klik "Tambah Tugas Baru" untuk memulai' : 'Tidak ada tugas dengan filter ini'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => {
        const categoryEmoji = {
            pelajaran: '📖',
            ujian: '📝',
            tugas: '📚',
            ekstrakurikuler: '🎨'
        };
        
        const priorityClass = `priority-${task.priority}`;
        const priorityText = {
            high: 'Tinggi',
            medium: 'Sedang',
            low: 'Rendah'
        };
        
        const deadline = new Date(task.deadline);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let deadlineText = '';
        if (diffDays < 0) {
            deadlineText = `Terlambat ${Math.abs(diffDays)} hari`;
        } else if (diffDays === 0) {
            deadlineText = 'Hari ini!';
        } else if (diffDays === 1) {
            deadlineText = 'Besok';
        } else {
            deadlineText = `${diffDays} hari lagi`;
        }
        
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${task.title}</h3>
                        ${task.description ? `<p style="color: #6b7280; margin-top: 5px;">${task.description}</p>` : ''}
                    </div>
                </div>
                
                <div class="task-meta">
                    <div class="meta-item">
                        <span>${categoryEmoji[task.category]}</span>
                        <span>${task.category}</span>
                    </div>
                    ${task.subject ? `
                        <div class="meta-item">
                            <span>📚</span>
                            <span>${task.subject}</span>
                        </div>
                    ` : ''}
                    <div class="meta-item">
                        <span>📅</span>
                        <span>${deadlineText}</span>
                    </div>
                    <span class="priority-badge ${priorityClass}">
                        ${priorityText[task.priority]}
                    </span>
                </div>
                
                <div class="task-actions">
                    <button class="action-btn complete-btn" onclick="toggleTask(${task.id})">
                        <span>${task.completed ? '↩️' : '✅'}</span>
                        <span>${task.completed ? 'Batalkan' : 'Selesai'}</span>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                        <span>🗑️</span>
                        <span>Hapus</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
    document.getElementById('completion-rate').textContent = `${rate}%`;
}

function saveTasks() {
    localStorage.setItem('sma-tasks', JSON.stringify(tasks));
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Set minimum date to today
document.getElementById('task-deadline').min = new Date().toISOString().split('T')[0];

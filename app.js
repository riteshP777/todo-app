// -------------------------------------------------------------------------- //
//                            CONFIG & STATE MANAGEMENT                       //
// -------------------------------------------------------------------------- //
const CATEGORIES = {
    personal: { name: 'Personal', color: '#8b5cf6', gradientEnd: '#ec4899' },
    work: { name: 'Work', color: '#0ea5e9', gradientEnd: '#4f46e5' },
    shopping: { name: 'Shopping', color: '#ec4899', gradientEnd: '#f59e0b' },
    fitness: { name: 'Fitness', color: '#10b981', gradientEnd: '#059669' }
};

// Priority weight for sorting
const PRIORITY_WEIGHTS = {
    high: 3,
    medium: 2,
    low: 1
};

// App State
let state = {
    todos: [],
    filter: 'all',
    search: '',
    sortBy: 'date-created-desc',
    selectedCategory: 'personal',
    modalSelectedCategory: 'personal',
    theme: 'dark'
};

// -------------------------------------------------------------------------- //
//                                DOM ELEMENTS                                //
// -------------------------------------------------------------------------- //
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const categoryPillsContainer = document.getElementById('category-pills');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date-input');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.getElementById('sort-select');

const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');

const currentDateText = document.getElementById('date-text');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Stats Elements
const progressPercentText = document.getElementById('progress-percent');
const progressRing = document.getElementById('progress-ring-circle');
const progressComment = document.getElementById('progress-comment');
const pendingCountText = document.getElementById('pending-count');
const completedCountText = document.getElementById('completed-count');
const starredCountText = document.getElementById('starred-count');
const clearAllBtn = document.getElementById('clear-all-btn');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTodoIdInput = document.getElementById('edit-todo-id');
const editTitleInput = document.getElementById('edit-title');
const modalCategoryPills = document.getElementById('modal-category-pills');
const editPrioritySelect = document.getElementById('edit-priority');
const editDueDateInput = document.getElementById('edit-due-date');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Confetti Canvas
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

// -------------------------------------------------------------------------- //
//                               INITIALIZATION                               //
// -------------------------------------------------------------------------- //
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Load data from localStorage
    loadFromLocalStorage();

    // 2. Set current date
    displayCurrentDate();

    // 3. Initialize UI handlers
    setupEventListeners();

    // 4. Set Category Pill listeners
    setupCategoryPills();

    // 5. Render application state
    render();

    // 6. Setup Confetti Canvas Sizing
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// -------------------------------------------------------------------------- //
//                               EVENT LISTENERS                              //
// -------------------------------------------------------------------------- //
function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Form submission
    todoForm.addEventListener('submit', handleAddTodo);

    // Search bar
    searchInput.addEventListener('input', (e) => {
        state.search = e.target.value.trim();
        if (state.search.length > 0) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        render();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.search = '';
        clearSearchBtn.classList.add('hidden');
        render();
    });

    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.filter = tab.dataset.filter;
            render();
        });
    });

    // Sorting dropdown
    sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        render();
    });

    // Clear completed tasks button
    clearAllBtn.addEventListener('click', handleClearCompleted);

    // Close Modals
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    // Edit modal form submission
    editForm.addEventListener('submit', handleSaveEdit);
}

// Handle switching categories in main creator
function setupCategoryPills() {
    const pills = categoryPillsContainer.querySelectorAll('.pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.selectedCategory = pill.dataset.category;
        });
    });
}

// Render dynamic elements for modal category picker
function renderModalCategoryPills(selectedCat) {
    modalCategoryPills.innerHTML = '';
    Object.keys(CATEGORIES).forEach(key => {
        const cat = CATEGORIES[key];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pill ${key === selectedCat ? 'active' : ''}`;
        btn.dataset.category = key;
        btn.style.setProperty('--pill-color', cat.color);
        btn.innerHTML = `<span class="pill-dot"></span>${cat.name}`;

        btn.addEventListener('click', () => {
            const allModalPills = modalCategoryPills.querySelectorAll('.pill');
            allModalPills.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            state.modalSelectedCategory = key;
        });

        modalCategoryPills.appendChild(btn);
    });
}

// -------------------------------------------------------------------------- //
//                                STATE ACTIONS                               //
// -------------------------------------------------------------------------- //

// Add task
function handleAddTodo(e) {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;

    const newTodo = {
        id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: title,
        completed: false,
        category: state.selectedCategory,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value ? dueDateInput.value : null,
        starred: false,
        dateCreated: Date.now(),
        dateCompleted: null
    };

    state.todos.push(newTodo);
    saveToLocalStorage();
    render();

    // Reset Form
    todoForm.reset();

    // Re-active default category pill
    const pills = categoryPillsContainer.querySelectorAll('.pill');
    pills.forEach(p => {
        p.classList.remove('active');
        if (p.dataset.category === 'personal') {
            p.classList.add('active');
        }
    });
    state.selectedCategory = 'personal';

    // Smooth scroll list to top if sorted newest
    if (state.sortBy === 'date-created-desc') {
        todoList.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Toggle Complete
function handleToggleComplete(id, checkboxElement) {
    state.todos = state.todos.map(todo => {
        if (todo.id === id) {
            const nowCompleted = !todo.completed;
            if (nowCompleted) {
                // Celebration! Trigger confetti at the checkbox position
                const rect = checkboxElement.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                triggerConfetti(x, y);
            }
            return {
                ...todo,
                completed: nowCompleted,
                dateCompleted: nowCompleted ? Date.now() : null
            };
        }
        return todo;
    });

    saveToLocalStorage();

    // Slight delay before re-rendering list to let completion animation breathe
    setTimeout(() => {
        render();
    }, 250);
}

// Toggle Star/Pin
function handleToggleStar(id) {
    state.todos = state.todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, starred: !todo.starred };
        }
        return todo;
    });
    saveToLocalStorage();
    render();
}

// Delete Task
function handleDeleteTodo(id, itemElement) {
    itemElement.classList.add('removing');

    // Wait for slideOut transition to complete before removing from state
    itemElement.addEventListener('animationend', (e) => {
        if (e.animationName === 'slideOut') {
            state.todos = state.todos.filter(todo => todo.id !== id);
            saveToLocalStorage();
            render();
        }
    });
}

// Open Edit Modal
function openEditModal(todo) {
    state.modalSelectedCategory = todo.category;
    editTodoIdInput.value = todo.id;
    editTitleInput.value = todo.title;
    editPrioritySelect.value = todo.priority;
    editDueDateInput.value = todo.dueDate || '';

    renderModalCategoryPills(todo.category);
    editModal.classList.add('active');
}

function closeEditModal() {
    editModal.classList.remove('active');
}

// Save Task Changes
function handleSaveEdit(e) {
    e.preventDefault();
    const id = editTodoIdInput.value;
    const title = editTitleInput.value.trim();
    if (!title) return;

    state.todos = state.todos.map(todo => {
        if (todo.id === id) {
            return {
                ...todo,
                title: title,
                category: state.modalSelectedCategory,
                priority: editPrioritySelect.value,
                dueDate: editDueDateInput.value ? editDueDateInput.value : null
            };
        }
        return todo;
    });

    saveToLocalStorage();
    closeEditModal();
    render();
}

// Clear Completed Tasks
function handleClearCompleted() {
    const completedCount = state.todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    // Animate items out
    const items = todoList.querySelectorAll('.todo-item');
    let animationsToWait = 0;

    items.forEach(item => {
        if (item.classList.contains('completed')) {
            item.classList.add('removing');
            animationsToWait++;
            item.addEventListener('animationend', () => {
                animationsToWait--;
                if (animationsToWait === 0) {
                    state.todos = state.todos.filter(todo => !todo.completed);
                    saveToLocalStorage();
                    render();
                }
            });
        }
    });

    if (animationsToWait === 0) {
        state.todos = state.todos.filter(todo => !todo.completed);
        saveToLocalStorage();
        render();
    }
}

// -------------------------------------------------------------------------- //
//                               RENDER ROUTINES                              //
// -------------------------------------------------------------------------- //
function render() {
    // 1. Process data: Filter and Sort
    let processedTodos = [...state.todos];

    // Filter by type
    if (state.filter === 'pending') {
        processedTodos = processedTodos.filter(todo => !todo.completed);
    } else if (state.filter === 'completed') {
        processedTodos = processedTodos.filter(todo => todo.completed);
    } else if (state.filter === 'starred') {
        processedTodos = processedTodos.filter(todo => todo.starred);
    }

    // Filter by search string
    if (state.search) {
        const query = state.search.toLowerCase();
        processedTodos = processedTodos.filter(todo => todo.title.toLowerCase().includes(query));
    }

    // Sorting
    processedTodos.sort((a, b) => {
        if (state.sortBy === 'date-created-desc') {
            return b.dateCreated - a.dateCreated;
        }
        if (state.sortBy === 'date-created-asc') {
            return a.dateCreated - b.dateCreated;
        }
        if (state.sortBy === 'due-date-asc') {
            // Put todos without due date at the very end
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (state.sortBy === 'priority-desc') {
            return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
        }
        return 0;
    });

    // 2. Render List Items
    todoList.innerHTML = '';

    if (processedTodos.length === 0) {
        emptyState.classList.remove('hidden');
        todoList.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        todoList.style.display = 'flex';

        processedTodos.forEach((todo, idx) => {
            const item = createTodoItemNode(todo, idx);
            todoList.appendChild(item);
        });
    }

    // 3. Update Statistics
    updateDashboardStats();
}

// Create a DOM node for a single Todo item
function createTodoItemNode(todo, index) {
    const catData = CATEGORIES[todo.category] || CATEGORIES.personal;

    const item = document.createElement('div');
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    item.dataset.id = todo.id;
    item.style.setProperty('--todo-color', catData.color);
    item.style.setProperty('--todo-gradient-end', catData.gradientEnd);
    item.style.animationDelay = `${index * 0.05}s`;

    // Left Section
    const leftDiv = document.createElement('div');
    leftDiv.className = 'todo-left';

    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'checkbox-container';

    const inputCheckbox = document.createElement('input');
    inputCheckbox.type = 'checkbox';
    inputCheckbox.checked = todo.completed;
    inputCheckbox.addEventListener('change', () => handleToggleComplete(todo.id, inputCheckbox));

    const checkmarkSpan = document.createElement('span');
    checkmarkSpan.className = 'checkmark';

    checkboxLabel.appendChild(inputCheckbox);
    checkboxLabel.appendChild(checkmarkSpan);
    leftDiv.appendChild(checkboxLabel);

    // Body (Title & Meta)
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'todo-body';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-title';
    titleSpan.textContent = todo.title;
    titleSpan.title = "Double click to edit";
    titleSpan.addEventListener('dblclick', () => openEditModal(todo));

    const metaDiv = document.createElement('div');
    metaDiv.className = 'todo-meta';

    // Badge: Category
    const catBadge = document.createElement('span');
    catBadge.className = 'todo-badge category-badge';
    catBadge.style.setProperty('--badge-bg', `rgba(${hexToRgb(catData.color)}, 0.08)`);
    catBadge.style.setProperty('--badge-color', catData.color);
    catBadge.innerHTML = `<span class="pill-dot" style="--pill-color: ${catData.color}"></span>${catData.name}`;
    metaDiv.appendChild(catBadge);

    // Badge: Priority
    let priorityColor = 'var(--text-secondary)';
    let priorityBg = 'rgba(255, 255, 255, 0.03)';
    if (todo.priority === 'high') {
        priorityColor = 'var(--color-red)';
        priorityBg = 'rgba(244, 63, 94, 0.08)';
    } else if (todo.priority === 'medium') {
        priorityColor = 'var(--color-amber)';
        priorityBg = 'rgba(245, 158, 11, 0.08)';
    }
    const prioBadge = document.createElement('span');
    prioBadge.className = 'todo-badge priority-badge';
    prioBadge.style.setProperty('--priority-bg', priorityBg);
    prioBadge.style.setProperty('--priority-color', priorityColor);
    prioBadge.textContent = todo.priority;
    metaDiv.appendChild(prioBadge);

    // Badge: Due Date
    if (todo.dueDate) {
        const dateBadge = document.createElement('span');
        dateBadge.className = 'todo-badge date-badge';

        const dateObj = new Date(todo.dueDate);
        const formattedDate = formatTodoDate(dateObj);

        // Check if overdue
        const now = new Date();
        const isOverdue = dateObj < now && !todo.completed;
        const isDueToday = dateObj.toDateString() === now.toDateString() && !todo.completed;

        if (isOverdue) {
            dateBadge.classList.add('overdue');
            dateBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Overdue: ${formattedDate}`;
        } else if (isDueToday) {
            dateBadge.classList.add('due-today');
            dateBadge.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Due Today: ${formattedDate}`;
        } else {
            dateBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${formattedDate}`;
        }

        metaDiv.appendChild(dateBadge);
    }

    bodyDiv.appendChild(titleSpan);
    bodyDiv.appendChild(metaDiv);
    leftDiv.appendChild(bodyDiv);
    item.appendChild(leftDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'todo-actions';

    // Action: Star
    const starBtn = document.createElement('button');
    starBtn.type = 'button';
    starBtn.className = `action-btn star-btn ${todo.starred ? 'active' : ''}`;
    starBtn.ariaLabel = "Pin task";
    starBtn.innerHTML = todo.starred ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    starBtn.addEventListener('click', () => handleToggleStar(todo.id));
    actionsDiv.appendChild(starBtn);

    // Action: Edit
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn edit-btn';
    editBtn.ariaLabel = "Edit task";
    editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    editBtn.addEventListener('click', () => openEditModal(todo));
    actionsDiv.appendChild(editBtn);

    // Action: Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.ariaLabel = "Delete task";
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.addEventListener('click', () => handleDeleteTodo(todo.id, item));
    actionsDiv.appendChild(deleteBtn);

    item.appendChild(actionsDiv);

    return item;
}

// -------------------------------------------------------------------------- //
//                              DASHBOARD UTILITIES                           //
// -------------------------------------------------------------------------- //
function updateDashboardStats() {
    const total = state.todos.length;
    const completed = state.todos.filter(t => t.completed).length;
    const pending = total - completed;
    const starred = state.todos.filter(t => t.starred).length;

    // Numbers display
    pendingCountText.textContent = pending;
    completedCountText.textContent = completed;
    starredCountText.textContent = starred;

    // Progress percentage
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressPercentText.textContent = `${percent}%`;

    // SVG Circular progress
    // Radius = 34. Circumference = 2 * PI * R = 213.628
    const circumference = 2 * Math.PI * 34;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;

    // Motivating comment
    let comment = "Ready to crush some goals?";
    if (percent === 100 && total > 0) {
        comment = "All caught up! You are awesome! 🎉";
    } else if (percent >= 70) {
        comment = "Almost there! Keep pushing!";
    } else if (percent >= 40) {
        comment = "You are doing great!";
    } else if (percent > 0) {
        comment = "Off to a good start!";
    }
    progressComment.textContent = comment;
}

// -------------------------------------------------------------------------- //
//                             GENERAL UTILITIES                              //
// -------------------------------------------------------------------------- //

// Display Date
function displayCurrentDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const today = new Date();
    currentDateText.textContent = today.toLocaleDateString('en-US', options);
}

// Helper formatting for Todo item due dates
function formatTodoDate(dateObj) {
    const now = new Date();
    const diffTime = dateObj - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateOptions = { month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    const timeStr = dateObj.toLocaleTimeString('en-US', timeOptions);
    const dateStr = dateObj.toLocaleDateString('en-US', dateOptions);

    if (dateObj.toDateString() === now.toDateString()) {
        return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
        return `Tomorrow at ${timeStr}`;
    } else if (diffDays === -1) {
        return `Yesterday at ${timeStr}`;
    } else {
        return `${dateStr}, ${timeStr}`;
    }
}

// Hex code to RGB mapping helper
function hexToRgb(hex) {
    let c = hex.substring(1);
    if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

// Theme handling
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    localStorage.setItem('aura_todo_theme', newTheme);
}

// Sync LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('aura_todos', JSON.stringify(state.todos));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('aura_todos');
    if (saved) {
        try {
            state.todos = JSON.parse(saved);
        } catch (e) {
            state.todos = [];
        }
    }

    const savedTheme = localStorage.getItem('aura_todo_theme');
    if (savedTheme) {
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Match system media preferences
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
    }
}

// -------------------------------------------------------------------------- //
//                              CONFETTI CELEBRATION ENGINE                   //
// -------------------------------------------------------------------------- //
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 5;

        // Velocity (explode outwards and slightly upwards)
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2; // Bias upwards

        this.color = `hsl(${Math.random() * 360}, 85%, 60%)`;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.2 - 0.1;
        this.gravity = 0.25;
        this.opacity = 1;
        this.fadeSpeed = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fadeSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        // Draw square or triangle randomly
        if (Math.random() > 0.5) {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(this.size / 2, this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

function triggerConfetti(x, y) {
    // Generate particles
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push(new ConfettiParticle(x, y));
    }

    // Start animation loop if not running
    if (!confettiAnimationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter out invisible particles
    confettiParticles = confettiParticles.filter(p => p.opacity > 0);

    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiAnimationId = null;
    }
}

/**
 * Utility functions
 */

// Format date
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format relative time
export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Get initials from name
export function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Truncate text
export function truncate(text, length = 100) {
    return text.length > length ? text.slice(0, length) + '...' : text;
}

// Get badge tier from percentage
export function getBadgeTier(percentage) {
    if (percentage >= 100) return 'master';
    if (percentage >= 90) return 'gold';
    if (percentage >= 50) return 'silver';
    if (percentage >= 25) return 'bronze';
    return null;
}

// Create element with classes
export function createElement(tag, className, innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
}

// Show toast notification
export function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    const toast = createElement('div', `toast ${type}`, `
    <div class="toast-icon">${getToastIcon(type)}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `);
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('hiding'), 5000);
    setTimeout(() => toast.remove(), 5300);
}

function createToastContainer() {
    const container = createElement('div', 'toast-container top-right');
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return icons[type] || icons.info;
}

// Redirect based on role
export function redirectToDashboard(role) {
    const paths = {
        student: '/pages/student-dashboard.html',
        instructor: '/pages/instructor-dashboard.html',
        admin: '/pages/admin-dashboard.html'
    };
    window.location.href = paths[role] || paths.student;
}

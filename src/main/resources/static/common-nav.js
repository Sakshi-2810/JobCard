// ========== SIDEBAR FUNCTIONALITY ==========

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    // Initialize sidebar state from localStorage
    const sidebarState = localStorage.getItem('sidebar-collapsed');
    if (sidebarState === 'true') {
        sidebar?.classList.add('collapsed');
    }

    // Sidebar toggle button
    sidebarToggle?.addEventListener('click', function() {
        sidebar?.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar?.classList.contains('collapsed'));
    });

    // Mobile menu toggle
    mobileMenuToggle?.addEventListener('click', function() {
        sidebar?.classList.toggle('mobile-closed');
        sidebarOverlay?.classList.toggle('active');
    });

    // Close sidebar when overlay is clicked
    sidebarOverlay?.addEventListener('click', function() {
        sidebar?.classList.add('mobile-closed');
        sidebarOverlay?.classList.remove('active');
    });

    // Close sidebar when menu item is clicked
    const menuLinks = document.querySelectorAll('.sidebar-menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only close on mobile
            if (window.innerWidth < 768) {
                sidebar?.classList.add('mobile-closed');
                sidebarOverlay?.classList.remove('active');
            }

            // Set active link
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set active link on page load
    setActiveLink();

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            sidebar?.classList.remove('mobile-closed');
            sidebarOverlay?.classList.remove('active');
        }
    });
});

// Set active menu link based on current page
function setActiveLink() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.sidebar-menu-link');

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href.split('/').pop())) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ========== UTILITY FUNCTIONS ==========

// Toggle collapsed state
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('collapsed');
    localStorage.setItem('sidebar-collapsed', sidebar?.classList.contains('collapsed'));
}

// Close sidebar programmatically
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (window.innerWidth < 768) {
        sidebar?.classList.add('mobile-closed');
        overlay?.classList.remove('active');
    }
}

// Open sidebar programmatically
function openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar?.classList.remove('mobile-closed');
    overlay?.classList.add('active');
}

// Show loading spinner
function showLoading() {
    let loader = document.getElementById('loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            backdrop-filter: blur(2px);
        `;
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loader.appendChild(spinner);
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show alert/toast message
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container') || createAlertContainer();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
    `;
    alert.style.margin = '0 0 12px 0';
    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Create alert container
function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2500;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

// Get alert icon based on type
function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-circle',
        warning: 'exclamation-triangle',
        primary: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(value);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Format datetime
function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Debounce function for search inputs
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

// Confirm dialog
function confirmAction(message) {
    return confirm(message || 'Are you sure you want to continue?');
}

// Set menu label for collapsed sidebar
document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.sidebar-menu-link');
    menuLinks.forEach(link => {
        const text = link.querySelector('.sidebar-menu-text')?.textContent || 'Menu';
        link.setAttribute('data-label', text);
    });
});


window.showToast = function(message, type = 'success', duration = 4000) {
    let container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    let iconName = 'check_circle';
    if (type === 'error') iconName = 'error';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 20px;">${iconName}</span>
        <span>${message}</span>
        <button type="button" class="toast-close-btn" aria-label="Cerrar notificación">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }
    }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.preventDefault();
            const isFav = favBtn.classList.toggle('is-favorite');
            favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
            const name = favBtn.dataset.sitterName || 'Cuidador';
            if (isFav) {
                window.showToast(`${name} guardado en favoritos`, 'success');
            } else {
                window.showToast(`${name} eliminado de favoritos`, 'info');
            }
        }
    });
});

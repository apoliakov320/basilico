import './style.css';

/* =========================================
   1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ========================================= */
const modal = document.getElementById('booking-modal');
const modalForm = document.getElementById('modal-form');
const modalSuccess = document.getElementById('modal-success');
const modalHeader = document.getElementById('modal-header');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

/* =========================================
   2. МОДАЛЬНОЕ ОКНО
   ========================================= */
window.openModal = function() {
    const dateInput = document.getElementById('modal-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    if (modalHeader) modalHeader.classList.remove('hidden');
    if (modalForm) {
        modalForm.reset();
        modalForm.classList.remove('hidden');
        
        ['name-error', 'phone-error', 'agree-error', 'date-error', 'time-error'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
        
        ['modal-name', 'modal-phone', 'modal-date', 'modal-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('!border-red-500');
        });
        
        const errBox = document.getElementById('form-global-error');
        if (errBox) errBox.remove();
    }
    if (modalSuccess) modalSuccess.classList.add('hidden');
    if (modal) modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    setTimeout(() => document.getElementById('modal-name')?.focus(), 50);
};

window.closeModal = function() {
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
};

if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) window.closeModal(); });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.closeModal(); });

/* =========================================
   3. МАСКА ДЛЯ ВРЕМЕНИ (ЧЧ:ММ)
   ========================================= */
const timeInput = document.getElementById('modal-time');
if (timeInput) {
    timeInput.addEventListener('input', function() {
        let val = this.value.replace(/\D/g, ''); 
        if (val.length >= 3) {
            val = val.slice(0, 2) + ':' + val.slice(2, 4);
        }
        this.value = val;
    });
}

/* =========================================
   4. ОТПРАВКА ФОРМЫ (С ПОЛНОЙ ПРОВЕРКОЙ)
   ========================================= */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('modal-name');
    const phoneInput = document.getElementById('modal-phone');
    const dateInput = document.getElementById('modal-date');
    const timeInput = document.getElementById('modal-time');
    const guestsInput = document.getElementById('modal-guests');
    const agreeInput = document.getElementById('modal-agree');
    
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const dateError = document.getElementById('date-error');
    const timeError = document.getElementById('time-error');
    const agreeError = document.getElementById('agree-error');

    if (!nameInput || !phoneInput) return;

    [nameInput, phoneInput, dateInput, timeInput].forEach(i => i.classList.remove('!border-red-500'));
    ['name-error', 'phone-error', 'date-error', 'time-error', 'agree-error'].forEach(id => document.getElementById(id)?.classList.add('hidden'));

    let valid = true;

    const nameValue = nameInput.value.trim();
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/; 
    if (nameValue.length < 2 || !nameRegex.test(nameValue)) {
        nameInput.classList.add('!border-red-500');
        if (nameError) nameError.classList.remove('hidden');
        valid = false;
    }

    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
        phoneInput.classList.add('!border-red-500');
        if (phoneError) phoneError.classList.remove('hidden');
        valid = false;
    }
    
    let dateValid = true;
    if (!dateInput.value) {
        dateValid = false;
    } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);

        if (selectedDate < today || selectedDate > nextYear) {
            dateValid = false;
        }
    }

    if (!dateValid) {
        dateInput.classList.add('!border-red-500');
        if (dateError) {
            dateError.textContent = 'Выберите корректную дату';
            dateError.classList.remove('hidden');
        }
        valid = false;
    }

    if (!timeInput.value || timeInput.value.length < 5 || !timeInput.value.includes(':')) {
        timeInput.classList.add('!border-red-500');
        if (timeError) timeError.classList.remove('hidden');
        valid = false;
    }

    if (agreeInput && !agreeInput.checked) {
        if (agreeError) agreeError.classList.remove('hidden');
        valid = false;
    }

    if (!valid) return; 

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Отправка...';
    submitBtn.disabled = true;

    const oldErrorBox = document.getElementById('form-global-error');
    if (oldErrorBox) oldErrorBox.remove();

    try {
        const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: nameValue, 
                phone: phoneInput.value,
                date: dateInput.value,
                time: timeInput.value,
                guests: guestsInput.value
            })
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        if (modalHeader) modalHeader.classList.add('hidden');
        if (modalForm) modalForm.classList.add('hidden');
        if (modalSuccess) modalSuccess.classList.remove('hidden');
        
        modalForm.reset();
        setTimeout(window.closeModal, 4000);

    } catch (error) {
        console.error('Ошибка отправки:', error);
        
        let errorBox = document.getElementById('form-global-error');
        if (!errorBox) {
            errorBox = document.createElement('p');
            errorBox.id = 'form-global-error';
            errorBox.className = 'text-red-500 text-xs text-center mt-2 font-semibold';
            submitBtn.parentNode.appendChild(errorBox);
        }
        errorBox.textContent = 'Не удалось отправить. Проверьте интернет.';
        
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

document.getElementById('modal-form')?.addEventListener('submit', handleFormSubmit);

/* =========================================
   5. МОБИЛЬНОЕ МЕНЮ
   ========================================= */
window.toggleMenu = function() {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.contains('translate-x-0');
    
    if (isOpen) {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('menu-open');
    } else {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.classList.add('menu-open');
    }
};

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', window.toggleMenu);
}

/* =========================================
   6. ВКЛАДКИ МЕНЮ
   ========================================= */
window.openMenuTab = function(tabId, btnElement) {
    document.querySelectorAll('.menu-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.menu-tab-content').forEach(content => content.classList.remove('active'));
    btnElement.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
};

/* =========================================
   7. АНИМАЦИИ ПРИ СКРОЛЛЕ
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    reveals.forEach(reveal => revealOnScroll.observe(reveal));
});

/* =========================================
   8. СКРЫТИЕ ПЛАВАЮЩЕЙ КНОПКИ В ФУТЕРЕ
   ========================================= */
const floatingBtn = document.getElementById('floating-btn');
const footer = document.getElementById('contacts');

if (floatingBtn && footer) {
    window.addEventListener('scroll', () => {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight - 50) {
            floatingBtn.classList.add('translate-y-24', 'opacity-0');
            floatingBtn.classList.remove('translate-y-0', 'opacity-100');
        } else {
            floatingBtn.classList.remove('translate-y-24', 'opacity-0');
            floatingBtn.classList.add('translate-y-0', 'opacity-100');
        }
    });
}
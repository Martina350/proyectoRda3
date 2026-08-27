
(function () {
    const ENHANCED = new WeakMap();
    let openInstance = null;

    function enhanceAll(root) {
        const scope = root || document;
        scope.querySelectorAll('select').forEach((select) => enhance(select));
    }

    function enhance(select) {
        if (!select || select.tagName !== 'SELECT') return;
        if (select.multiple || select.dataset.nativeSelect === 'true') return;
        if (select.dataset.pccEnhanced === 'true') {
            refresh(select);
            return;
        }

        const parent = select.parentElement;
        let wrap = parent && parent.classList.contains('pcc-select')
            ? parent
            : null;

        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'pcc-select';
            select.parentNode.insertBefore(wrap, select);
            wrap.appendChild(select);
        }

        if (select.classList.contains('sort-select')) {
            wrap.classList.add('pcc-select--compact');
        }
        if (select.classList.contains('input') || select.classList.contains('login-input')) {
            wrap.classList.add('pcc-select--form');
        }
        if (select.classList.contains('booking-select') || select.classList.contains('booking-select-input')) {
            wrap.classList.add('pcc-select--booking');
        }
        if (select.classList.contains('select-with-icon') || select.classList.contains('form-control')) {
            wrap.classList.add('pcc-select--booking');
        }

        select.classList.add('pcc-select-native');
        select.dataset.pccEnhanced = 'true';
        select.setAttribute('tabindex', '-1');
        select.setAttribute('aria-hidden', 'true');

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'pcc-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        if (select.id) {
            trigger.id = select.id + '-trigger';
            trigger.setAttribute('aria-labelledby', select.id + '-trigger');
        }
        if (select.disabled) trigger.disabled = true;

        const label = document.createElement('span');
        label.className = 'pcc-select-label';
        trigger.appendChild(label);

        const chevron = document.createElement('span');
        chevron.className = 'material-symbols-outlined pcc-select-chevron';
        chevron.setAttribute('aria-hidden', 'true');
        chevron.textContent = 'expand_more';
        trigger.appendChild(chevron);

        const list = document.createElement('ul');
        list.className = 'pcc-select-menu';
        list.setAttribute('role', 'listbox');
        list.hidden = true;

        wrap.appendChild(trigger);
        wrap.appendChild(list);

        const state = { wrap, trigger, label, list, chevron };
        ENHANCED.set(select, state);

        rebuildOptions(select);
        syncInvalid(select);

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (select.disabled) return;
            toggle(select);
        });

        trigger.addEventListener('keydown', (e) => onTriggerKey(e, select));
        list.addEventListener('keydown', (e) => onListKey(e, select));

        select.addEventListener('change', () => {
            rebuildOptions(select);
            syncInvalid(select);
        });

        select.addEventListener('invalid', () => syncInvalid(select));


        select.focus = function focusCustomSelect() {
            trigger.focus();
        };

        const mo = new MutationObserver(() => rebuildOptions(select));
        mo.observe(select, { childList: true, subtree: true, characterData: true, attributes: true });
        state.observer = mo;

        const attrMo = new MutationObserver(() => {
            trigger.disabled = !!select.disabled;
            wrap.classList.toggle('is-disabled', !!select.disabled);
            syncInvalid(select);
        });
        attrMo.observe(select, { attributes: true, attributeFilter: ['disabled', 'class'] });
        state.attrObserver = attrMo;
    }

    function refresh(select) {
        if (!select || select.dataset.pccEnhanced !== 'true') {
            enhance(select);
            return;
        }
        rebuildOptions(select);
        syncInvalid(select);
    }

    function rebuildOptions(select) {
        const state = ENHANCED.get(select);
        if (!state) return;

        const { list, label, trigger } = state;
        const wasOpen = !list.hidden;
        const activeValue = select.value;

        list.innerHTML = '';

        Array.from(select.options).forEach((opt, index) => {
            if (opt.hidden) return;

            const item = document.createElement('li');
            item.className = 'pcc-select-option';
            item.setAttribute('role', 'option');
            item.dataset.value = opt.value;
            item.dataset.index = String(index);
            item.id = (select.id || 'pcc-select') + '-opt-' + index;
            item.textContent = opt.textContent.trim();
            item.tabIndex = -1;

            if (opt.disabled) {
                item.classList.add('is-disabled');
                item.setAttribute('aria-disabled', 'true');
            }
            if (opt.value === '' && opt.disabled) {
                item.classList.add('is-placeholder');
            }
            if (opt.selected) {
                item.classList.add('is-selected');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.setAttribute('aria-selected', 'false');
            }

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (opt.disabled) return;
                choose(select, opt.value);
            });

            list.appendChild(item);
        });

        const selected = select.options[select.selectedIndex];
        const placeholder = Array.from(select.options).find((o) => o.value === '' && o.disabled);
        if (selected && !(selected.value === '' && selected.disabled)) {
            label.textContent = selected.textContent.trim();
            label.classList.remove('is-placeholder');
        } else {
            label.textContent = (placeholder && placeholder.textContent.trim()) || 'Seleccionar...';
            label.classList.add('is-placeholder');
        }

        if (wasOpen) {

            open(select);
            const match = list.querySelector(`.pcc-select-option[data-value="${cssEscape(activeValue)}"]`);
            if (match && !match.classList.contains('is-disabled')) {
                match.focus();
            }
        }
    }

    function cssEscape(value) {
        if (window.CSS && typeof CSS.escape === 'function') return CSS.escape(String(value));
        return String(value).replace(/"/g, '\\"');
    }

    function choose(select, value) {
        if (select.value !== value) {
            select.value = value;
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            rebuildOptions(select);
        }
        close(select);
        const state = ENHANCED.get(select);
        if (state) state.trigger.focus();
    }

    function toggle(select) {
        const state = ENHANCED.get(select);
        if (!state) return;
        if (state.list.hidden) open(select);
        else close(select);
    }

    function open(select) {
        const state = ENHANCED.get(select);
        if (!state || select.disabled) return;

        if (openInstance && openInstance !== select) {
            close(openInstance);
        }

        state.list.hidden = false;
        state.trigger.setAttribute('aria-expanded', 'true');
        state.wrap.classList.add('is-open');
        openInstance = select;

        const selected = state.list.querySelector('.pcc-select-option.is-selected:not(.is-disabled)')
            || state.list.querySelector('.pcc-select-option:not(.is-disabled)');
        if (selected) {
            selected.focus();
            selected.scrollIntoView({ block: 'nearest' });
        }

        positionMenu(state);
    }

    function close(select) {
        const state = ENHANCED.get(select);
        if (!state) return;
        state.list.hidden = true;
        state.trigger.setAttribute('aria-expanded', 'false');
        state.wrap.classList.remove('is-open');
        if (openInstance === select) openInstance = null;
    }

    function closeAll() {
        if (openInstance) close(openInstance);
    }

    function positionMenu(state) {
        const triggerRect = state.trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const preferUp = spaceBelow < 240 && spaceAbove > spaceBelow;
        state.wrap.classList.toggle('is-drop-up', preferUp);

        const available = Math.max(160, (preferUp ? spaceAbove : spaceBelow) - 16);
        state.list.style.maxHeight = Math.min(340, available) + 'px';
    }

    function syncInvalid(select) {
        const state = ENHANCED.get(select);
        if (!state) return;
        let invalid = select.classList.contains('input-invalid')
            || select.getAttribute('aria-invalid') === 'true';
        try {
            if (select.required && !select.value && select.validity && !select.validity.valid) {
                invalid = true;
            }
        } catch (_) {}
        state.wrap.classList.toggle('is-invalid', !!invalid);
    }

    function enabledOptions(list) {
        return Array.from(list.querySelectorAll('.pcc-select-option:not(.is-disabled)'));
    }

    function onTriggerKey(e, select) {
        const state = ENHANCED.get(select);
        if (!state) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(select);
        } else if (e.key === 'Escape') {
            close(select);
        }
    }

    function onListKey(e, select) {
        const state = ENHANCED.get(select);
        if (!state) return;
        const options = enabledOptions(state.list);
        if (!options.length) return;

        const current = document.activeElement;
        let idx = options.indexOf(current);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            options[(idx + 1) % options.length].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            options[(idx - 1 + options.length) % options.length].focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            options[0].focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            options[options.length - 1].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (current && current.classList.contains('pcc-select-option')) {
                choose(select, current.dataset.value);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            close(select);
            if (e.key === 'Escape') {
                e.preventDefault();
                state.trigger.focus();
            }
        }
    }

    document.addEventListener('click', (e) => {
        if (!openInstance) return;
        const state = ENHANCED.get(openInstance);
        if (state && !state.wrap.contains(e.target)) {
            close(openInstance);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll();
    });

    window.addEventListener('resize', closeAll);
    window.addEventListener('scroll', (e) => {
        if (!openInstance) return;
        const state = ENHANCED.get(openInstance);
        if (state && (e.target === state.list || state.list.contains(e.target))) {
            return;
        }
        close(openInstance);
    }, true);

    function boot() {
        enhanceAll();

        const bodyObserver = new MutationObserver((mutations) => {
            let needsScan = false;
            mutations.forEach((m) => {
                m.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    if (node.tagName === 'SELECT' || (node.querySelector && node.querySelector('select'))) {
                        needsScan = true;
                    }
                });
            });
            if (needsScan) enhanceAll();
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.PCC_CUSTOM_SELECT = {
        enhance,
        enhanceAll,
        refresh,
        refreshAll: enhanceAll,
        closeAll
    };
})();

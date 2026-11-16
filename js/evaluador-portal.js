(function () {
    const SESSION_TOKEN = 'evaluadorGoogleToken';
    const SESSION_NOMBRE = 'evaluadorNombre';
    const SESSION_EMAIL = 'evaluadorEmail';

    function getSesion() {
        const token = sessionStorage.getItem(SESSION_TOKEN);
        const nombre = sessionStorage.getItem(SESSION_NOMBRE);
        const email = sessionStorage.getItem(SESSION_EMAIL);
        if (!token || !nombre || !email) return null;
        return { token, nombre, email };
    }

    function setSesion(data, token) {
        sessionStorage.setItem(SESSION_TOKEN, token);
        sessionStorage.setItem(SESSION_NOMBRE, data.nombre);
        sessionStorage.setItem(SESSION_EMAIL, data.email);
    }

    function clearSesion() {
        sessionStorage.removeItem(SESSION_TOKEN);
        sessionStorage.removeItem(SESSION_NOMBRE);
        sessionStorage.removeItem(SESSION_EMAIL);
    }

    function show(el, visible) {
        if (!el) return;
        el.hidden = !visible;
    }

    function setError(message) {
        const box = document.getElementById('portalLoginError');
        if (!box) return;
        if (!message) {
            box.hidden = true;
            box.textContent = '';
            return;
        }
        box.hidden = false;
        box.textContent = message;
    }

    function ensureEvaluadorOption(nombre) {
        const select = document.getElementById('evaluador');
        if (!select) return;
        let option = Array.from(select.options).find(o => o.value === nombre);
        if (!option) {
            option = document.createElement('option');
            option.value = nombre;
            option.textContent = nombre;
            select.appendChild(option);
        }
        select.value = nombre;
    }

    function setTipoYProveedor(tipo, proveedor) {
        const radios = document.querySelectorAll('input[name="tipoProveedor"]');
        radios.forEach(radio => {
            radio.disabled = false;
            radio.checked = radio.value === tipo;
        });

        const select = document.getElementById('proveedor');
        if (!select) return;
        select.innerHTML = '';
        const option = document.createElement('option');
        option.value = proveedor;
        option.textContent = proveedor;
        select.appendChild(option);
        select.value = proveedor;
    }

    function renderCards(data) {
        const cards = document.getElementById('portalCards');
        const empty = document.getElementById('portalEmpty');
        const done = document.getElementById('portalDoneList');
        const summary = document.getElementById('portalSummaryText');
        if (!cards) return;

        cards.innerHTML = '';
        const pendientes = data.pendientes || [];
        const completados = data.completados || [];

        if (summary) {
            summary.textContent = pendientes.length
                ? `Te faltan ${pendientes.length} de ${data.total || pendientes.length + completados.length} proveedores asignados.`
                : 'No tienes proveedores pendientes por evaluar este año.';
        }

        show(empty, pendientes.length === 0);
        show(cards, pendientes.length > 0);

        pendientes.forEach(item => {
            const tipo = item.tipo === 'SERVICIO' ? 'servicio' : 'producto';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `portal-card portal-card-${tipo}`;
            button.setAttribute('aria-label', `Evaluar ${item.proveedor}`);
            button.innerHTML = `
                <span class="portal-card-type">${tipo === 'servicio' ? 'Servicio' : 'Producto'}</span>
                <strong class="portal-card-name">${item.proveedor}</strong>
                <span class="portal-card-cta">
                    Evaluar
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </span>
            `;
            button.addEventListener('click', () => empezarEvaluacion(item.tipo, item.proveedor));
            cards.appendChild(button);
        });

        if (done) {
            if (completados.length === 0) {
                done.hidden = true;
                done.innerHTML = '';
            } else {
                done.hidden = false;
                done.innerHTML = `<h3>Completados (${completados.length})</h3>` + completados.map(item =>
                    `<div class="portal-done-item"><span>${item.proveedor}</span><em>${item.tipo === 'SERVICIO' ? 'Servicio' : 'Producto'}</em></div>`
                ).join('');
            }
        }
    }

    async function refrescarTableroEvaluador() {
        const sesion = getSesion();
        const login = document.getElementById('portalLogin');
        const board = document.getElementById('portalBoard');
        const navBack = document.getElementById('portalNavBack');
        if (!sesion) {
            show(login, true);
            show(board, false);
            if (navBack) navBack.hidden = false;
            return;
        }

        show(login, false);
        show(board, true);
        if (navBack) navBack.hidden = true;
        const nombreEl = document.getElementById('portalUserName');
        const emailEl = document.getElementById('portalUserEmail');
        const avatarEl = document.getElementById('portalUserAvatar');
        if (nombreEl) nombreEl.textContent = presentarNombre(sesion.nombre);
        if (emailEl) emailEl.textContent = sesion.email;
        if (avatarEl) avatarEl.textContent = iniciales(sesion.nombre);
        ensureEvaluadorOption(sesion.nombre);
        if (!tickTimer) startSessionWatch();
        else setSessionBarVisible(true);

        try {
            const anio = new Date().getFullYear();
            const data = await cargarPendientesEvaluador(anio);
            renderCards(data);
            return {
                ...data,
                pendientesCount: (data.pendientes || []).length
            };
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                clearSesion();
                show(login, true);
                show(board, false);
                if (navBack) navBack.hidden = false;
                setError(error.message || 'La sesión expiró. Inicia sesión otra vez.');
                renderGoogleButton();
                return null;
            }
            setError(error.message || 'No se pudieron cargar los proveedores pendientes.');
            return null;
        }
    }

    async function empezarEvaluacion(tipo, proveedor) {
        const sesion = getSesion();
        if (!sesion) {
            setError('Debes iniciar sesión para evaluar.');
            return;
        }
        ensureEvaluadorOption(sesion.nombre);
        setTipoYProveedor(tipo, proveedor);

        const context = document.getElementById('evalContext');
        if (context) {
            context.innerHTML = `
                <div class="eval-context-card">
                    <div><span>Evaluador</span><strong>${sesion.nombre}</strong></div>
                    <div><span>Proveedor</span><strong>${proveedor}</strong></div>
                    <div><span>Tipo</span><strong>${tipo === 'SERVICIO' ? 'Servicio' : 'Producto'}</strong></div>
                </div>
            `;
        }

        if (typeof mostrarItemsEvaluacion === 'function') {
            await mostrarItemsEvaluacion();
        }
        if (typeof mostrarPaso === 'function') {
            mostrarPaso(3);
        }
    }

    async function handleGoogleCredential(response) {
        setError('');
        const credential = response && response.credential;
        if (!credential) {
            setError('No se recibió la credencial de Google.');
            return;
        }
        try {
            sessionStorage.setItem(SESSION_TOKEN, credential);
            const data = await iniciarSesionGoogle(credential);
            setSesion(data, credential);
            await refrescarTableroEvaluador();
            startSessionWatch();
        } catch (error) {
            clearSesion();
            // Mensaje genérico: no revelar si el correo existe o no
            setError('No se pudo iniciar sesión. Inténtalo de nuevo o contacta al administrador.');
            renderGoogleButton();
        }
    }

    async function renderGoogleButton() {
        const slot = document.getElementById('googleSignInSlot');
        if (!slot) return;
        slot.innerHTML = '';

        let config;
        try {
            config = await obtenerGoogleClientId();
        } catch (error) {
            slot.innerHTML = '<p class="portal-hint">No se pudo cargar el acceso con Google.</p>';
            return;
        }

        if (!config.configured || !config.clientId) {
            slot.innerHTML = '<p class="portal-hint">El acceso con Google aún no está configurado en el servidor.</p>';
            return;
        }

        const start = () => {
            if (!window.google || !google.accounts || !google.accounts.id) {
                setTimeout(start, 200);
                return;
            }
            google.accounts.id.initialize({
                client_id: config.clientId,
                callback: handleGoogleCredential,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            google.accounts.id.renderButton(slot, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'pill',
                width: 320
            });
        };
        start();
    }

    function iniciales(nombre) {
        const parts = String(nombre || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'E';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function presentarNombre(nombre) {
        return String(nombre || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
            .join(' ');
    }

    const DEFAULT_SESSION_MIN = 10;
    const PROMPT_MS = 60 * 1000; // 1 min para responder "¿Sigues ahí?"
    let sessionMs = DEFAULT_SESSION_MIN * 60 * 1000;
    let sessionDeadline = 0;
    let promptDeadline = 0;
    let tickTimer = null;
    let promptMode = false;

    function resolverSessionMs() {
        const raw = (typeof configEvaluacion !== 'undefined' && configEvaluacion)
            ? Number(configEvaluacion.minutosSesion)
            : DEFAULT_SESSION_MIN;
        let mins = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_MIN;
        if (mins > 240) mins = 240;
        sessionMs = mins * 60 * 1000;
        return sessionMs;
    }

    function formatMmSs(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function setSessionBarVisible(visible) {
        const bar = document.getElementById('sessionTimerBar');
        if (!bar) return;
        bar.hidden = !visible;
    }

    function updateCountdownUi(msLeft) {
        const text = formatMmSs(msLeft);
        const top = document.getElementById('sessionCountdown');
        if (top) top.textContent = text;
        const bar = document.getElementById('sessionTimerBar');
        if (bar) bar.classList.toggle('is-urgent', msLeft <= 60 * 1000 && msLeft > 0);
    }

    function stopSessionWatch() {
        if (tickTimer) clearInterval(tickTimer);
        tickTimer = null;
        sessionDeadline = 0;
        promptDeadline = 0;
        promptMode = false;
        const modal = document.getElementById('idleModal');
        if (modal) modal.classList.remove('show');
        setSessionBarVisible(false);
        updateCountdownUi(sessionMs);
    }

    function cerrarSesionEvaluador(porInactividad) {
        stopSessionWatch();
        clearSesion();
        setError('');
        const evaluador = document.getElementById('evaluador');
        if (evaluador) evaluador.value = '';
        show(document.getElementById('portalLogin'), true);
        show(document.getElementById('portalBoard'), false);
        const navBack = document.getElementById('portalNavBack');
        if (navBack) navBack.hidden = false;
        renderGoogleButton();
        if (typeof mostrarPaso === 'function') mostrarPaso(1);
        if (porInactividad) {
            setError('La sesión se cerró por tiempo. Vuelve a iniciar sesión si necesitas continuar.');
        }
    }

    function mostrarAvisoSesion() {
        if (!getSesion()) return;
        promptMode = true;
        promptDeadline = Date.now() + PROMPT_MS;
        const modal = document.getElementById('idleModal');
        const countdownEl = document.getElementById('idleCountdown');
        if (!modal) {
            cerrarSesionEvaluador(true);
            return;
        }
        modal.classList.add('show');
        if (countdownEl) countdownEl.textContent = String(Math.round(PROMPT_MS / 1000));
        updateCountdownUi(PROMPT_MS);
    }

    function tickSessionWatch() {
        if (!getSesion()) {
            stopSessionWatch();
            return;
        }
        const now = Date.now();
        if (promptMode) {
            const left = promptDeadline - now;
            updateCountdownUi(left);
            const countdownEl = document.getElementById('idleCountdown');
            if (countdownEl) countdownEl.textContent = String(Math.max(0, Math.ceil(left / 1000)));
            if (left <= 0) {
                const modal = document.getElementById('idleModal');
                if (modal) modal.classList.remove('show');
                cerrarSesionEvaluador(true);
            }
            return;
        }
        const left = sessionDeadline - now;
        updateCountdownUi(left);
        if (left <= 0) {
            mostrarAvisoSesion();
        }
    }

    // Contador fijo: no se reinicia por actividad, solo al iniciar sesión o al decir "sigo aquí"
    function startSessionWatch() {
        if (!getSesion()) {
            stopSessionWatch();
            return;
        }
        promptMode = false;
        promptDeadline = 0;
        const ms = resolverSessionMs();
        sessionDeadline = Date.now() + ms;
        setSessionBarVisible(true);
        updateCountdownUi(ms);
        if (tickTimer) clearInterval(tickTimer);
        tickTimer = setInterval(tickSessionWatch, 1000);
    }

    function seguirAqui() {
        const modal = document.getElementById('idleModal');
        if (modal) modal.classList.remove('show');
        startSessionWatch();
    }

    function initSessionWatch() {
        const stayBtn = document.getElementById('idleStayBtn');
        if (stayBtn) stayBtn.addEventListener('click', seguirAqui);
        const leaveBtn = document.getElementById('idleLeaveBtn');
        if (leaveBtn) leaveBtn.addEventListener('click', () => cerrarSesionEvaluador(true));
    }

    function initPortal() {
        const logoutBtn = document.getElementById('cerrarSesionEvaluadorBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => cerrarSesionEvaluador(false));

        const volverBtn = document.getElementById('volverAlTableroBtn');
        if (volverBtn) {
            volverBtn.addEventListener('click', async function () {
                if (typeof mostrarPaso === 'function') mostrarPaso(1);
                await refrescarTableroEvaluador();
            });
        }

        initSessionWatch();

        if (getSesion()) {
            refrescarTableroEvaluador();
            startSessionWatch();
        } else {
            renderGoogleButton();
            setSessionBarVisible(false);
        }
    }

    window.refrescarTableroEvaluador = refrescarTableroEvaluador;
    window.cerrarSesionEvaluador = cerrarSesionEvaluador;
    window.getSesionEvaluador = getSesion;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortal);
    } else {
        initPortal();
    }
})();

/**
 * RUN & SURVIVE - EL CEREBRO (MAIN.JS)
 * Gestor de estado y despachador de UI-Supervivencia.
 */

class GameEngine {
    constructor() {
        this.STORAGE_KEY = 'RS_STATE';
        this.state = this.loadState();
        
        // Inicializar módulos
        if (typeof RunningModule !== 'undefined') this.running = new RunningModule(this);
        if (typeof GPSManager !== 'undefined') this.gps = new GPSManager(this);
        if (typeof BaseModule !== 'undefined') this.base = new BaseModule(this);

        this.init();
    }

    init() {
        console.log("🛠️ Engine: HUB de Supervivencia conectado.");
        
        if (this.running) this.running.checkDecay();

        this.bindEvents();
        this.updateUI();

        // Mensaje inicial
        const msg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('bienvenida') : "Conexión establecida. No mueras hoy, Recluta.";
        this.logMessage(msg, "info");

        // Intervalo para actualizar el tiempo de carrera si está activo
        setInterval(() => {
            if (this.gps && this.gps.isActive) {
                this.gps.updateLiveUI();
            }
        }, 1000);
    }

    loadState() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("❌ Engine: Error al leer el diario.", e);
            }
        }
        
        return {
            version: "2.0",
            gameMode: 'chill',
            statsHistory: [],
            survivor: {
                name: "Superviviente",
                resources: { wood: 10, metal: 5, scraps: 0 },
                vitality: { health: 100, water: 80, food: 80 },
                progression: { xp: 0, level: 1, nextLevelXp: 100 },
                stats: { totalKm: 0, runs: 0 },
                lastActivity: Date.now()
            },
            resourceLimits: { global: 100 },
            base: {
                level: 1,
                structures: []
            }
        };
    }

    saveState() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    }

    dispatch(action, payload) {
        switch(action) {
            case 'PROCESS_SESSION':
                if (this.running) this.running.processSession(payload.km, payload.type, payload.time);
                // Al terminar, ocultar panel de carrera
                document.getElementById('run-data').style.display = 'none';
                this.updateActionButtons(false);
                break;
            case 'ADD_RESOURCES':
                this.addResources(payload);
                break;
            case 'UI_NAVIGATE':
                this.switchView(payload.view);
                break;
            case 'CONSTRUCT_BUILDING':
                if (this.base) this.base.construirEdificio(payload.id);
                break;
        }

        this.updateUI();
        this.saveState();
    }

    addResources(resources) {
        const bonus = this.base ? this.base.getEffectValue('storage') : 0;
        const limit = (this.state.resourceLimits?.global || 100) + bonus;

        for (const [res, amount] of Object.entries(resources)) {
            if (this.state.survivor.resources.hasOwnProperty(res)) {
                const current = this.state.survivor.resources[res];
                const added = Math.min(amount, limit - current);
                this.state.survivor.resources[res] += added;
            }
        }
    }

    updateUI() {
        const { resources, vitality } = this.state.survivor;
        
        // Barras de Estado
        this.updateBar('health', vitality.health);
        this.updateBar('water', vitality.water);
        this.updateBar('food', vitality.food);

        // Recursos
        const woodEl = document.getElementById('res-wood');
        const metalEl = document.getElementById('res-metal');
        const scrapsEl = document.getElementById('res-scraps');

        if (woodEl) woodEl.textContent = resources.wood;
        if (metalEl) metalEl.textContent = resources.metal;
        if (scrapsEl) scrapsEl.textContent = resources.scraps;

        // Base Status en la pestaña Refugio
        const baseStatus = document.getElementById('base-status');
        if (baseStatus) {
            const structuresList = this.state.base.structures.map(s => {
                const statusStr = s.status === 'building' ? `<span style="color:var(--primary)">En construcción: ${s.kmRemaining.toFixed(1)}km</span>` : '<span style="color:var(--secondary)">Operativo</span>';
                return `<div style="font-size: 0.75rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.2rem; display: flex; justify-content: space-between;">
                            <span>${s.name}</span> 
                            ${statusStr}
                        </div>`;
            }).join('');

            baseStatus.innerHTML = `
                <div style="text-align: left; background: var(--bg-card); padding: 1rem; border-radius: 4px; border: 1px solid var(--border);">
                    <p style="color: var(--primary); font-weight: bold; margin-bottom: 0.8rem; font-size: 0.7rem; text-transform: uppercase;">ESTADO DEL ASENTAMIENTO - NIVEL ${this.state.base.level}</p>
                    ${structuresList || '<p style="font-size: 0.7rem; color: var(--text-low);">No hay estructuras. El páramo es un lugar vacío.</p>'}
                </div>
            `;
        }

        // Historial en la pestaña Diario
        this.renderJournal();
    }

    updateBar(id, value) {
        const bar = document.getElementById(`bar-${id}`);
        const text = document.getElementById(`val-${id}`);
        if (bar) bar.style.width = `${value}%`;
        if (text) text.textContent = `${Math.floor(value)}%`;
    }

    renderJournal() {
        const list = document.getElementById('journal-list');
        if (!list) return;

        const history = this.state.statsHistory || [];
        if (history.length === 0) {
            list.innerHTML = `<p style="text-align: center; color: var(--text-low); padding: 2rem;">No hay registros en el diario. Aún no has dejado huella.</p>`;
            return;
        }

        list.innerHTML = history.slice().reverse().map(run => {
            const date = new Date(run.date).toLocaleDateString();
            const mode = run.mode === 'running' ? 'HUIDA' : 'EXPLORACIÓN';
            return `
                <div class="journal-card">
                    <div class="journal-header">
                        <span>${date}</span>
                        <span style="color: ${run.mode === 'running' ? 'var(--primary)' : 'var(--secondary)'}">${mode}</span>
                    </div>
                    <div class="journal-stats">
                        <div class="stat-group"><span class="val">${run.distance.toFixed(2)}</span><span class="unit">KM</span></div>
                        <div class="stat-group"><span class="val">${Math.floor(run.time)}</span><span class="unit">MIN</span></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    logMessage(text, type = "info") {
        const log = document.getElementById('event-log');
        if (!log) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `<span style="opacity: 0.5;">[${time}]</span> ${text}`;
        
        log.prepend(entry);
    }

    switchView(viewId) {
        // Update Sections
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) target.classList.add('active');

        // Update Tabs
        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.view === viewId);
        });

        if (viewId === 'journal') this.renderJournal();
    }

    bindEvents() {
        // Navigation Tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchView(tab.dataset.view);
            });
        });

        // Action Buttons
        const btnExplorar = document.getElementById('btn-explorar');
        const btnHuida = document.getElementById('btn-huida');

        const toggleGPS = (mode) => {
            if (!this.gps) return;

            if (this.gps.isActive) {
                this.gps.stopTracking();
                this.updateActionButtons(false);
            } else {
                this.gps.startTracking();
                document.getElementById('run-data').style.display = 'block';
                this.updateActionButtons(true, mode);
            }
        };

        if (btnExplorar) btnExplorar.addEventListener('click', () => toggleGPS('explorar'));
        if (btnHuida) btnHuida.addEventListener('click', () => toggleGPS('huida'));
    }

    updateActionButtons(isActive, mode = null) {
        const btnExplorar = document.getElementById('btn-explorar');
        const btnHuida = document.getElementById('btn-huida');

        if (!isActive) {
            btnExplorar.classList.remove('active');
            btnExplorar.innerHTML = `<span class="label">Paso Lento</span>MODO EXPLORADOR`;
            btnHuida.classList.remove('active');
            btnHuida.innerHTML = `<span class="label">Sprints / Huida</span>MODO HUIDA`;
        } else {
            if (mode === 'explorar') {
                btnExplorar.classList.add('active');
                btnExplorar.innerHTML = `DETENER RASTREO`;
                btnHuida.style.display = 'none';
            } else {
                btnHuida.classList.add('active');
                btnHuida.innerHTML = `DETENER HUIDA`;
                btnExplorar.style.display = 'none';
            }
        }

        // Show/Hide other buttons logic
        if (!isActive) {
            btnExplorar.style.display = 'flex';
            btnHuida.style.display = 'flex';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Engine = new GameEngine();
});

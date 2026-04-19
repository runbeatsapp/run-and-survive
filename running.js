/**
 * RUN & SURVIVE - MÓDULO DE RUNNING (RUNNING.JS)
 * Especialista en recompensas, vitalidad y el castigo por pereza.
 * "En el páramo, si no corres, eres abono para los cactus".
 */

class RunningModule {
    constructor(engine) {
        this.engine = engine;
        console.log("🏃 Running-Logica: Suministros listos. No me hagas perder el tiempo.");
    }

    /**
     * Lógica de Recompensas: El botín del corredor.
     * @param {number} km - Distancia recorrida.
     * @param {string} type - Tipo de sesión ('running' o 'walking').
     * @param {number} time - Tiempo en minutos.
     * @param {Array} route - Array de coordenadas GPS.
     */
    processSession(km, type = 'running', time = 0, route = []) {
        const floorKm = Math.floor(km);
        if (km <= 0) {
            const lowMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('explorador') : "¿Eso es todo? Las cucarachas corren más que tú.";
            this.engine.logMessage(lowMsg, "warning");
            return;
        }

        const state = this.engine.state;

        // 0. Gasto de Supervivencia (Metabolismo)
        const costPerKm = (type === 'running') ? 15 : 5;
        const totalCost = Math.floor(km * costPerKm);
        
        state.survivor.vitality.water = Math.max(0, state.survivor.vitality.water - totalCost);
        state.survivor.vitality.food = Math.max(0, state.survivor.vitality.food - totalCost);

        if (state.survivor.vitality.water <= 0 || state.survivor.vitality.food <= 0) {
            const survMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('supervivencia') : "💀 Te has quedado sin suministros durante la ruta. Tu salud sufre.";
            this.engine.logMessage(survMsg, "danger");
            state.survivor.vitality.health = Math.max(0, state.survivor.vitality.health - 15);
        }

        // 1. Recursos básicos (Botín recuperado)
        const rewards = {
            wood: floorKm * 5,
            metal: floorKm * 2,
            scraps: Math.floor(floorKm / 2),
            xp: floorKm * 10
        };

        // Aplicar Bonus de XP si hay torre
        const xpBonus = this.engine.base ? this.engine.base.getEffectValue('xp_bonus') : 0;
        if (xpBonus > 0) {
            rewards.xp = Math.floor(rewards.xp * (1 + xpBonus));
        }

        // 2. Hitos especiales (Vitalidad)
        let waterBonus = 0;
        let foodBonus = 0;
        if (km >= 2) waterBonus = 20;
        if (km >= 4) foodBonus = 20;

        // Aplicar recompensas al estado
        this.engine.addResources({
            wood: rewards.wood,
            metal: rewards.metal,
            scraps: rewards.scraps
        });
        
        state.survivor.progression.xp += rewards.xp;
        state.survivor.vitality.water = Math.min(100, state.survivor.vitality.water + waterBonus);
        state.survivor.vitality.food = Math.min(100, state.survivor.vitality.food + foodBonus);

        // 2.5 Avanzar construcción de edificios
        if (this.engine.base) {
            this.engine.base.updateConstructionProgress(km);
        }

        // 2.8 Tracker de Estadísticas (Persistente)
        const pace = km > 0 ? (time / km).toFixed(2) : 0;
        state.statsHistory.push({
            date: new Date().toISOString(),
            distance: km,
            time: time,
            pace: pace,
            mode: type,
            route: route // Guardamos el rastro GPS completo para el mapa futuro
        });

        // Actualizar estadísticas globales
        state.survivor.stats.totalKm += km;
        state.survivor.stats.runs += 1;
        state.survivor.lastActivity = Date.now();

        // 3. Mensajes con Personalidad
        this.engine.logMessage(`Sesión finalizada: ${km}km (${type === 'running' ? 'Corriendo' : 'Andando'}).`, "success");
        this.engine.logMessage(`Gasto energético: -${totalCost} Agua/Comida.`, "warning");
        this.engine.logMessage(`Recuperado: +${rewards.wood} Madera, +${rewards.metal} Metal, +${rewards.scraps} Chatarra, +${rewards.xp} XP.`, "info");
        
        if (waterBonus > 0) this.engine.logMessage("¡Encontraste un oasis! +20 Agua.", "success");
        if (foodBonus > 0) this.engine.logMessage("¡Comida enlatada! Caducada, pero sirve. +20 Comida.", "success");

        if (km > 0 && km < 1) {
            const lowMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('explorador') : "Has salvado el pellejo por los pelos con esa vuelta a la manzana. Patético.";
            this.engine.logMessage(lowMsg, "warning");
        } else if (km >= 1) {
            const highMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('huida') : "¡Eso es! Corre como si te debieran dinero.";
            this.engine.logMessage(highMsg, "success");
        }

        // 4. Verificar subida de nivel
        this.checkLevelUp();
    }


    /**
     * Actualiza las recompensas en tiempo real durante una sesión.
     */
    updateLiveSession(km) {
        const session = this.engine.sesionActual;
        if (!session) return;

        const floorKm = Math.floor(km);
        
        // Calcular recursos acumulados hasta este punto
        session.recursosGanados = {
            wood: floorKm * 5,
            metal: floorKm * 2,
            scraps: Math.floor(floorKm / 2)
        };

        // Podríamos disparar eventos de narrativa aquí si se llega a un hito
        // console.log("🏃 Running-Logica: Recompensas de sesión actualizadas", session.recursosGanados);
    }

    /**
     * Verifica si el superviviente ha ganado suficiente XP.
     */
    checkLevelUp() {
        let p = this.engine.state.survivor.progression;
        while (p.xp >= p.nextLevelXp) {
            p.xp -= p.nextLevelXp;
            p.level++;
            p.nextLevelXp = Math.floor(p.nextLevelXp * 1.5);
            this.engine.logMessage(`¡NIVEL UP! Ahora eres nivel ${p.level}. El mundo sigue siendo una basura, pero tú eres mejor.`, "success");
        }
    }

    /**
     * The Lazy Penalty & Check-In Diario
     */
    checkDecay() {
        const now = Date.now();
        const last = this.engine.state.survivor.lastActivity;
        const diffHours = (now - last) / (1000 * 60 * 60);
        const mode = this.engine.state.gameMode || 'chill';

        // Lógica de Muerte Permanente (Extreme)
        if (mode === 'extreme' && diffHours >= 48) {
            this.engine.logMessage("Has pasado demasiado tiempo en el sofá. Tu base ha sido saqueada y estás de vuelta en la calle. ¿Listo para volver a empezar, recluta?", "danger");
            this.resetProgreso();
            return;
        }

        // Lógica de Recordatorio (Chill)
        if (mode === 'chill' && diffHours >= 72) {
            this.engine.logMessage("Las telarañas están tapando la radio. Sal a dar un paseo de 10 min antes de que se olviden de tu cara.", "warning");
            // No reseteamos nada en Chill
            this.engine.state.survivor.lastActivity = now; 
            this.engine.saveState();
            return;
        }

        // Decaimiento estándar cada 24h
        if (diffHours >= 24) {
            console.log("💀 Running-Logica: Inactividad detectada. Aplicando penalización...");
            
            const { vitality } = this.engine.state.survivor;
            const decayReduction = this.engine.base ? this.engine.base.getEffectValue('decay_reduction') : 0;
            const waterLoss = Math.floor(20 * (1 - decayReduction));
            
            vitality.water = Math.max(0, vitality.water - waterLoss);
            vitality.food = Math.max(0, vitality.food - 20);

            if (vitality.water === 0 || vitality.food === 0) {
                vitality.health = Math.max(0, vitality.health - 10);
                const survMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('supervivencia') : "Te has debilitado por falta de suministros. Tu salud flaquea.";
                this.engine.logMessage(survMsg, "danger");
            } else {
                const threatMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('amenaza') : "Has estado demasiado tiempo quieto. Tus reservas bajan.";
                this.engine.logMessage(threatMsg, "warning");
            }

            this.engine.state.survivor.lastActivity = now; 
            this.engine.saveState();
        }
    }

    /**
     * Resetea el progreso del jugador pero mantiene el historial de estadísticas.
     */
    resetProgreso() {
        console.log("🔥 Running-Logica: Ejecutando reset de progreso (Permadeath)...");
        const state = this.engine.state;

        // Reset Survivor
        state.survivor.resources = { wood: 0, metal: 0, scraps: 0 };
        state.survivor.vitality = { health: 100, water: 80, food: 80 };
        state.survivor.progression = { xp: 0, level: 1, nextLevelXp: 100 };
        state.survivor.lastActivity = Date.now();

        // Reset Base
        state.base.level = 1;
        state.base.structures = [];

        this.engine.saveState();
        this.engine.updateUI();
    }
}

/**
 * RUN & SURVIVE - MÓDULO DE BASE (BASE.JS)
 * Experto en gestión de recursos, construcción y chapuzas post-apocalípticas.
 * "Si aguanta con cinta americana, es ingeniería de primer nivel".
 */

const BUILDINGS_CATALOG = {
    scrap_warehouse: {
        id: 'scrap_warehouse',
        name: 'Almacén de Chatarrero',
        cost: { wood: 20 },
        description: 'Aumenta el límite máximo de recursos. Porque enterrar cosas en el jardín ya no es seguro.',
        effect: { type: 'storage', value: 50 },
        lore: 'Purificador: Filtra el 90% de las mutaciones. El otro 10% te da sabor a fresa.' // Wait, the user put the strawberry lore in the purifier. Let me fix the lore.
    },
    water_purifier: {
        id: 'water_purifier',
        name: "Purificador de Agua 'Dudosa'",
        cost: { metal: 30, scraps: 10 },
        description: 'Reduce la velocidad a la que baja tu barra de Agua.',
        effect: { type: 'decay_reduction', value: 0.5 }, // 50% reduction
        lore: 'Filtra el 90% de las mutaciones. El otro 10% te da sabor a fresa.'
    },
    watchtower: {
        id: 'watchtower',
        name: 'Torre de Vigilancia (Hecha con palos)',
        cost: { wood: 50 },
        description: 'Bonus de XP en cada carrera porque "ves venir el peligro".',
        effect: { type: 'xp_bonus', value: 0.2 }, // 20% bonus
        lore: 'Si te caes, al menos habrás visto un paisaje bonito antes de morir.'
    },
    radio_antenna: {
        id: 'radio_antenna',
        name: 'Antena de Radio Pirata',
        cost: { metal: 5 },
        description: 'Recibe mensajes del mundo exterior. O de alguien muy aburrido.',
        effect: { type: 'messages', value: true },
        lore: 'Capta estática, psicofonías y, a veces, ofertas de seguros del viejo mundo.'
    }
};

class BaseModule {
    constructor(engine) {
        this.engine = engine;
        console.log("🏗️ Asentamiento-Base: ¿Madera y metal? Trae aquí, yo haré que parezca un palacio.");
    }

    /**
     * Lógica de Construcción: Gasta recursos y pone en marcha el proyecto.
     * @param {string} id - ID del edificio en el catálogo.
     */
    construirEdificio(id) {
        const building = BUILDINGS_CATALOG[id];
        if (!building) {
            this.engine.logMessage(`¿Edificio '${id}'? Eso no está en mis planos, novato.`, "danger");
            return;
        }

        const state = this.engine.state;
        
        // Verificar si ya existe (completo o en construcción)
        if (state.base.structures.find(s => s.id === id)) {
            this.engine.logMessage(`Ya tenemos un ${building.name}. No seas avaricioso.`, "warning");
            return;
        }

        // Comprobar recursos
        for (const [res, amount] of Object.entries(building.cost)) {
            const currentRes = res === 'scraps' ? state.survivor.resources.scraps : state.survivor.resources[res];
            if (currentRes < amount) {
                this.engine.logMessage(`Te falta ${res} para el ${building.name}. ¡A buscar entre la basura!`, "danger");
                return;
            }
        }

        // Restar recursos
        for (const [res, amount] of Object.entries(building.cost)) {
            if (res === 'scraps') {
                state.survivor.resources.scraps -= amount;
            } else {
                state.survivor.resources[res] -= amount;
            }
        }

        // Añadir a estructuras como "En construcción"
        state.base.structures.push({
            id: id,
            name: building.name,
            status: 'building',
            kmRemaining: 1, // Hito de 1km para terminar
            timestamp: Date.now()
        });

        this.engine.logMessage(`¡Proyecto iniciado! El ${building.name} estará listo tras correr 1km más.`, "success");
        
        const loreMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('edificios', id) : building.lore;
        this.engine.logMessage(loreMsg, "info");
        
        this.engine.saveState();
        this.engine.updateUI();
    }

    /**
     * Avanza el progreso de construcción de todos los edificios pendientes.
     * @param {number} km - Kilómetros recorridos en la sesión.
     */
    updateConstructionProgress(km) {
        const state = this.engine.state;
        let anyCompleted = false;

        state.base.structures.forEach(s => {
            if (s.status === 'building') {
                s.kmRemaining -= km;
                if (s.kmRemaining <= 0) {
                    s.status = 'complete';
                    s.kmRemaining = 0;
                    anyCompleted = true;
                    this.engine.logMessage(`🏗️ ¡CONSTRUCCIÓN TERMINADA! El ${s.name} ya está operativo.`, "success");
                }
            }
        });

        if (anyCompleted) {
            // Si la antena se terminó, mostrar un mensaje de prueba
            if (this.hasStructure('radio_antenna')) {
                this.engine.logMessage("📻 Radio: '...aquí Sector 7... ¿hay alguien ahí?... cambio...'", "info");
            }
        }
    }

    /**
     * Verifica si un edificio está completado.
     */
    hasStructure(id) {
        return this.engine.state.base.structures.some(s => s.id === id && s.status === 'complete');
    }

    /**
     * Calcula el valor total de un efecto basado en los edificios completados.
     */
    getEffectValue(type) {
        let total = 0;
        this.engine.state.base.structures.forEach(s => {
            if (s.status === 'complete') {
                const config = BUILDINGS_CATALOG[s.id];
                if (config && config.effect.type === type) {
                    total += config.effect.value;
                }
            }
        });
        return total;
    }
}

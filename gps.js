/**
 * GPS-NATIVO (GPS.JS)
 * Experto en geolocalización y guardián de la precisión satelital.
 * "Si los satélites te ven, el páramo te teme."
 */

class GPSManager {
    constructor(engine) {
        this.engine = engine;
        this.watchId = null;
        this.lastPosition = null;
        this.totalDistance = 0; // Metros acumulados
        this.startTime = null;
        this.isActive = false;

        // --- REGLA DE ORO: CONFIGURACIÓN DE EFICIENCIA ---
        this.CONFIG = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000,
            minAccuracy: 35,      // Ignorar si el error es > 35m
            minMoveThreshold: 5,  // Solo contar si se mueve > 5m
            noiseSpeedLimit: 12   // Ignorar si va a > 43km/h (12m/s)
        };

        this.wakeLock = null;

        console.log("🛰️ GPS-Nativo: Sistema de rastreo inicializado.");
        this.initWakeLockListeners();
    }

    /**
     * Re-solicita el bloqueo si la app vuelve al primer plano.
     */
    initWakeLockListeners() {
        document.addEventListener('visibilitychange', async () => {
            if (this.isActive && this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.requestWakeLock();
            }
        });
    }

    /**
     * Bloquea la pantalla para evitar que se apague (Screen Wake Lock API).
     */
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log("🔒 GPS: Pantalla bloqueada. No nos detendremos.");
            } catch (err) {
                console.warn(`🛰️ GPS: No se pudo bloquear la pantalla: ${err.message}`);
            }
        }
    }

    /**
     * Libera el bloqueo de pantalla.
     */
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    }

    /**
     * Solicita permisos y arranca el motor si es posible.
     */
    async requestPermission() {
        if (!("geolocation" in navigator)) {
            this.engine.logMessage("GPS: Hardware no detectado. ¿Estás corriendo en una tostadora?", "danger");
            return false;
        }

        try {
            // En algunos navegadores/entornos APK, esto dispara el prompt nativo
            const result = await navigator.permissions.query({ name: 'geolocation' });
            
            if (result.state === 'denied') {
                const gpsMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('gps') : "GPS: Permiso denegado. Estás ciego en el mapa.";
                this.engine.logMessage(gpsMsg, "danger");
                return false;
            }
            
            return true;
        } catch (e) {
            // Fallback para navegadores que no soportan permissions.query
            return true; 
        }
    }

    /**
     * Inicia el rastreo de la sesión.
     */
    async startTracking() {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) return;

        this.totalDistance = 0;
        this.lastPosition = null;
        this.startTime = Date.now();
        this.isActive = true;

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => this.handleUpdate(pos),
            (err) => this.handleError(err),
            this.CONFIG
        );

        // Bloquear pantalla para la sesión
        await this.requestWakeLock();

        this.engine.logMessage("🛰️ GPS: Rastreo activo. ¡Muévete!", "success");
    }

    /**
     * Detiene el rastreo y apaga el sensor (Ahorro de batería).
     */
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        this.isActive = false;
        
        // Liberar pantalla
        this.releaseWakeLock();

        const finalKm = this.totalDistance / 1000;
        const totalTimeMin = (Date.now() - this.startTime) / 60000;
        
        // Clasificar tipo de actividad
        const avgSpeed = (this.totalDistance / ((Date.now() - this.startTime) / 1000));
        const type = avgSpeed > 2.2 ? 'running' : 'walking'; // > 8km/h es running

        this.engine.logMessage(`GPS: Sesión finalizada. ${finalKm.toFixed(2)}km registrados.`, "info");
        
        // Comunicación con el módulo de lógica
        this.engine.dispatch('PROCESS_SESSION', { 
            km: finalKm, 
            type: type, 
            time: totalTimeMin 
        });

        this.lastPosition = null;
    }

    /**
     * Procesa cada actualización del sensor.
     */
    handleUpdate(position) {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;

        // 1. Filtro de Precisión (Regla de Oro)
        if (accuracy > this.CONFIG.minAccuracy) {
            console.warn(`🛰️ GPS: Ignorando lectura imprecisa (${accuracy.toFixed(1)}m)`);
            return;
        }

        if (this.lastPosition) {
            const dist = this.calculateDistance(
                this.lastPosition.lat, this.lastPosition.lng,
                latitude, longitude
            );

            const timeDiff = (timestamp - this.lastPosition.time) / 1000; // segundos
            const speed = dist / timeDiff; // m/s

            // 2. Filtro de Ruido (Saltos imposibles)
            if (speed > this.CONFIG.noiseSpeedLimit) {
                this.engine.logMessage("⚠️ GPS: ¡Salto de señal detectado! Ignorando trampa.", "warning");
                return;
            }

            // 3. Umbral de Movimiento (Eficiencia)
            if (dist >= this.CONFIG.minMoveThreshold) {
                this.totalDistance += dist;
                console.log(`🛰️ GPS: +${dist.toFixed(1)}m (Total: ${this.totalDistance.toFixed(1)}m)`);
                
                // Opcional: Notificar al UI en tiempo real
                this.updateLiveUI();
            }
        }

        this.lastPosition = { lat: latitude, lng: longitude, time: timestamp };
    }

    /**
     * Fórmula Haversine: El estándar para distancias en esfera terrestre.
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    updateLiveUI() {
        const kmLabel = (this.totalDistance / 1000).toFixed(2);
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const min = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
        const sec = (timeElapsed % 60).toString().padStart(2, '0');

        const kmEl = document.getElementById('run-km');
        const timeEl = document.getElementById('run-time');
        
        if (kmEl) kmEl.textContent = `${kmLabel} km`;
        if (timeEl) timeEl.textContent = `${min}:${sec}`;
    }

    handleError(error) {
        let msg = "Error desconocido";
        switch(error.code) {
            case error.PERMISSION_DENIED: msg = "Permiso denegado."; break;
            case error.POSITION_UNAVAILABLE: msg = "Ubicación no disponible."; break;
            case error.TIMEOUT: msg = "Tiempo de espera agotado."; break;
        }
        const gpsMsg = typeof obtenerMensaje !== 'undefined' ? obtenerMensaje('gps') : `GPS Error: ${msg}`;
        this.engine.logMessage(gpsMsg, "danger");
        if (this.isActive) this.stopTracking();
    }
}

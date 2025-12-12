# 🎰 PLAN MAESTRO: Sistema Completo de Resultados de Lotería

**Fecha de Análisis:** 12 de Diciembre 2025, 00:25 AM  
**Analista:** AI Assistant  
**Objetivo:** Sistema escalable, rápido y con notificaciones push para TODOS los juegos de Lotería de la Ciudad

---

## 📊 ANÁLISIS COMPLETO DE JUEGOS

### ✅ Juegos Identificados y Analizados

| # | Juego | URL | Sorteos | Horarios | IDs | Prioridad |
|---|-------|-----|---------|----------|-----|-----------|
| 1 | **Quiniela Ciudad** | quiniela.loteriadelaciudad.gob.ar | 5 diarios | 10:15, 12:00, 15:00, 18:00, 21:00 | 51770+ | 🔴 ALTA |
| 2 | **Quiniela Poceada** | poceada.loteriadelaciudad.gob.ar | 1 diario | 21:00 | 9491+ | 🟡 MEDIA |
| 3 | **Tombolina** | tombolina.loteriadelaciudad.gob.ar | 1 diario | 15:00 | 4510+ | 🟡 MEDIA |
| 4 | **Loto Plus** | loto.loteriadelaciudad.gob.ar | 2 semanales | Mié 22:00, Sáb 22:00 | 3838+ | 🟢 BAJA |
| 5 | **Loto 5 Plus** | loto5.loteriadelaciudad.gob.ar | 1 semanal | Vier 22:30 | 1422+ | 🟢 BAJA |
| 6 | **Otra Chance** | (buscar) | ? | ? | ? | 🟢 BAJA |
| 7 | **La Grande** | (buscar) | ? | ? | ? | 🟢 BAJA |
| 8 | **Quiniela Ya** | (buscar) | ? | ? | ? | 🟢 BAJA |

### 🔍 Características Clave por Juego

#### 1. Quiniela de la Ciudad (YA IMPLEMENTADO)
- **Formato:** 20 números de 4 cifras + letras (solo Ciudad)
- **Jurisdicciones:** BsAs, Santa Fe, Córdoba (funcionan), Ciudad, Entre Ríos (IDs diferentes)
- **Frecuencia:** 5 sorteos diarios
- **API Actual:** `consultaResultados.php` (POST)
- **IDs Dinámicos:** Sí, obtenidos desde página principal

#### 2. Quiniela Poceada
- **Formato:** 8 números elegidos del 00-99 (usa extracto de Quiniela Ciudad)
- **Frecuencia:** 1 sorteo diario (21:00)
- **IDs:** Serie 9400+ (9491, 9490, 9489...)
- **Particularidad:** Depende del sorteo nocturno de Quiniela Ciudad

#### 3. Tombolina
- **Formato:** 3-7 números de 2 cifras (00-99)
- **Frecuencia:** 1 sorteo diario (15:00)
- **IDs:** Serie 4500+ (4510, 4509, 4508...)
- **Particularidad:** Usa extracto de Quiniela Matutina

#### 4. Loto Plus
- **Formato:** 6 números del 1-42 + sorteo adicional
- **Frecuencia:** 2 sorteos semanales (miércoles y sábado, 22:00)
- **IDs:** Serie 3800+ (3838, 3837...)
- **Particularidad:** Pozo acumulado

#### 5. Loto 5 Plus
- **Formato:** 5 números del 1-36
- **Frecuencia:** 1 sorteo semanal (viernes, 22:30)
- **IDs:** Serie 1400+ (1422, 1421...)
- **Particularidad:** Pozo acumulado

---

## 🏗️ ARQUITECTURA TÉCNICA PROPUESTA

### 1. BASE DE DATOS ESCALABLE

#### Opción A: Tabla Unificada (RECOMENDADO)

```sql
-- Tabla principal para TODOS los juegos
CREATE TABLE resultados_juegos (
    id BIGSERIAL PRIMARY KEY,
    tipo_juego TEXT NOT NULL,           -- 'quiniela', 'poceada', 'tombolina', 'loto', 'loto5'
    jurisdiccion TEXT,                  -- Solo para quiniela: 'BsAs', 'SantaFe', 'Cordoba', 'Ciudad', 'EntreRios'
    id_sorteo TEXT NOT NULL,            -- ID único del sorteo
    fecha DATE NOT NULL,
    hora TIME,                          -- Hora del sorteo
    turno TEXT,                         -- Solo para quiniela: 'La Previa', 'Primera', etc
    
    -- Datos flexibles (JSON)
    numeros JSONB NOT NULL,             -- Array de números [1234, 5678, ...] o [1, 2, 3, ...]
    extras JSONB,                       -- { "letras": ["A","B"], "pozo": 1000000, ... }
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    scrape_status TEXT DEFAULT 'success', -- 'success', 'pending', 'error'
    
    UNIQUE(tipo_juego, jurisdiccion, id_sorteo, fecha)
);

-- Índices para queries rápidas
CREATE INDEX idx_tipo_fecha ON resultados_juegos(tipo_juego, fecha DESC);
CREATE INDEX idx_tipo_jurisdiccion ON resultados_juegos(tipo_juego, jurisdiccion) WHERE jurisdiccion IS NOT NULL;
CREATE INDEX idx_fecha_tipo ON resultados_juegos(fecha DESC, tipo_juego);
CREATE INDEX idx_sorteo ON resultados_juegos(id_sorteo);

-- Tabla de suscripciones para notificaciones push
CREATE TABLE suscripciones_push (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT,                       -- ID único del usuario (puede ser anónimo)
    token TEXT NOT NULL UNIQUE,         -- Token FCM o endpoint Web Push
    tipo_notificacion TEXT NOT NULL,    -- 'web', 'fcm_android', 'fcm_ios'
    
    -- Filtros de suscripción
    juegos_suscritos JSONB NOT NULL,    -- ["quiniela", "loto", "tombolina"]
    jurisdicciones_suscritas JSONB,     -- ["BsAs", "Ciudad"] (solo para quiniela)
    turnos_suscritos JSONB,             -- ["Nocturna", "Primera"] (solo para quiniela)
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_notified_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT true
);

CREATE INDEX idx_suscripciones_activas ON suscripciones_push(active) WHERE active = true;
CREATE INDEX idx_juegos_suscritos ON suscripciones_push USING GIN(juegos_suscritos);

-- Tabla de notificaciones enviadas (audit log)
CREATE TABLE notificaciones_log (
    id BIGSERIAL PRIMARY KEY,
    resultado_id BIGINT REFERENCES resultados_juegos(id),
    suscripcion_id BIGINT REFERENCES suscripciones_push(id),
    enviada_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent',         -- 'sent', 'failed', 'clicked'
    error_message TEXT
);

-- Función de limpieza automática (mantener últimos 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_results()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM resultados_juegos
    WHERE fecha < CURRENT_DATE - INTERVAL '30 days';
    
    DELETE FROM notificaciones_log
    WHERE enviada_at < CURRENT_DATE - INTERVAL '90 days';
END;
$$;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_resultados
    BEFORE UPDATE ON resultados_juegos
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_suscripciones
    BEFORE UPDATE ON suscripciones_push
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

#### Ventajas de este Diseño:
- ✅ Una sola tabla para todos los juegos (simplicidad)
- ✅ JSONB flexible para diferentes formatos de datos
- ✅ Índices optimizados para queries comunes
- ✅ Sistema de suscripciones integrado
- ✅ Audit log para notificaciones
- ✅ Limpieza automática

---

### 2. ARQUITECTURA DE SCRAPERS

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS SCHEDULER                  │
│  Ejecuta scrapers en horarios específicos (cron jobs)       │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌────▼────┐
    │ Scraper │         │ Scraper │
    │ Diarios │         │Semanales│
    └────┬────┘         └────┬────┘
         │                   │
    ┌────▼──────────────────▼────┐
    │   SUPABASE EDGE FUNCTIONS  │
    │  - quiniela-scraper        │
    │  - poceada-scraper         │
    │  - tombolina-scraper       │
    │  - loto-scraper            │
    │  - loto5-scraper           │
    └────┬───────────────────────┘
         │
    ┌────▼────┐
    │   DB    │
    │ Postgres│
    └────┬────┘
         │
    ┌────▼────────┐
    │ Notificador │  ← Trigger SQL que detecta nuevos resultados
    │ Push (Edge) │     y envía notificaciones
    └─────────────┘
```

#### Estrategia de Scraping por Juego

##### A. Quiniela (5 sorteos diarios)
```yaml
Horarios de Ejecución (GitHub Actions):
  - Cron: "14 13,14,17,20,23 * * *"  # 5 min antes de cada sorteo
  - Modo: incremental (últimos 2 días)
  - Retry: 20 intentos en 5 minutos
  - Jurisdicciones: BsAs, SantaFe, Cordoba
```

##### B. Poceada (1 sorteo diario)
```yaml
Horarios de Ejecución:
  - Cron: "56 23 * * *"  # 20:56 Argentina (4 min antes)
  - Modo: single (solo sorteo de hoy)
  - Retry: 15 intentos en 3 minutos
  - Dependencia: Usa extracto de Quiniela Nocturna
```

##### C. Tombolina (1 sorteo diario)
```yaml
Horarios de Ejecución:
  - Cron: "56 17 * * *"  # 14:56 Argentina (4 min antes)
  - Modo: single
  - Retry: 15 intentos en 3 minutos
  - Dependencia: Usa extracto de Quiniela Matutina
```

##### D. Loto Plus (2 sorteos semanales)
```yaml
Horarios de Ejecución:
  - Cron: "55 1 * * 4,0"  # Miércoles y Sábado 22:55 ARG
  - Modo: single
  - Retry: 10 intentos en 10 minutos
```

##### E. Loto 5 Plus (1 sorteo semanal)
```yaml
Horarios de Ejecución:
  - Cron: "25 1 * * 6"  # Viernes 22:25 ARG
  - Modo: single
  - Retry: 10 intentos en 10 minutos
```

---

### 3. API CON CACHE LAYER

```typescript
// supabase/functions/resultados-api/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import sql from 'npm:postgres@3.4.4';

// Cache en memoria (Deno Deploy persiste por ~5 minutos)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

serve(async (req) => {
    const url = new URL(req.url);
    
    // Parámetros de query
    const tipo = url.searchParams.get('tipo') || 'all';  // 'quiniela', 'loto', etc
    const jurisdiccion = url.searchParams.get('jurisdiccion');
    const fecha = url.searchParams.get('fecha');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Generar cache key
    const cacheKey = `${tipo}_${jurisdiccion}_${fecha}_${limit}`;
    
    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return new Response(JSON.stringify({
            ...cached.data,
            cached: true,
            cache_age_ms: Date.now() - cached.timestamp
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=30'
            }
        });
    }
    
    // Query a DB
    const db = sql(Deno.env.get('DATABASE_URL')!, { max: 1 });
    
    try {
        let query = db`
            SELECT 
                id, tipo_juego, jurisdiccion, id_sorteo, fecha, hora, turno,
                numeros, extras, created_at
            FROM resultados_juegos
            WHERE 1=1
        `;
        
        // Filtros dinámicos
        if (tipo !== 'all') {
            query = db`${query} AND tipo_juego = ${tipo}`;
        }
        if (jurisdiccion) {
            query = db`${query} AND jurisdiccion = ${jurisdiccion}`;
        }
        if (fecha) {
            query = db`${query} AND fecha = ${fecha}`;
        }
        
        query = db`${query} ORDER BY fecha DESC, hora DESC LIMIT ${limit}`;
        
        const resultados = await query;
        
        const response = {
            status: 'ok',
            total: resultados.length,
            filters: { tipo, jurisdiccion, fecha },
            resultados
        };
        
        // Guardar en cache
        cache.set(cacheKey, { data: response, timestamp: Date.now() });
        
        // Limpiar cache viejo (cada 100 requests)
        if (Math.random() < 0.01) {
            const now = Date.now();
            for (const [key, value] of cache.entries()) {
                if ((now - value.timestamp) > CACHE_TTL * 10) {
                    cache.delete(key);
                }
            }
        }
        
        return new Response(JSON.stringify(response), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=30'
            }
        });
        
    } finally {
        await db.end();
    }
});
```

#### Endpoints Propuestos:
```bash
# Obtener todos los juegos (últimos 50)
GET /resultados-api

# Filtrar por tipo de juego
GET /resultados-api?tipo=quiniela

# Filtrar por jurisdicción (solo quiniela)
GET /resultados-api?tipo=quiniela&jurisdiccion=BsAs

# Obtener sorteo específico
GET /resultados-api?tipo=loto&fecha=2025-12-11

# Límite personalizado
GET /resultados-api?tipo=tombolina&limit=20
```

---

### 4. SISTEMA DE NOTIFICACIONES PUSH

#### A. Tecnología: Web Push API + Firebase Cloud Messaging (FCM)

```typescript
// supabase/functions/push-notifier/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import sql from 'npm:postgres@3.4.4';

serve(async (req) => {
    // Este endpoint se ejecuta automáticamente cuando hay nuevos resultados
    // (trigger SQL o llamado desde el scraper)
    
    const { tipo_juego, jurisdiccion, fecha, id_sorteo, numeros } = await req.json();
    
    const db = sql(Deno.env.get('DATABASE_URL')!, { max: 1 });
    
    try {
        // 1. Buscar suscriptores para este tipo de juego
        const suscriptores = await db`
            SELECT id, token, tipo_notificacion, juegos_suscritos, jurisdicciones_suscritas
            FROM suscripciones_push
            WHERE active = true
            AND ${tipo_juego} = ANY(juegos_suscritos)
            ${jurisdiccion ? db`AND (jurisdicciones_suscritas IS NULL OR ${jurisdiccion} = ANY(jurisdicciones_suscritas))` : db``}
        `;
        
        console.log(`📨 ${suscriptores.length} suscriptores encontrados para ${tipo_juego}`);
        
        // 2. Enviar notificaciones en paralelo
        const promises = suscriptores.map(async (sub) => {
            try {
                const payload = {
                    title: `🎰 ${tipo_juego.toUpperCase()} - Resultados!`,
                    body: `Sorteo ${id_sorteo} - Cabeza: ${numeros[0]}`,
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    data: {
                        tipo_juego,
                        jurisdiccion,
                        fecha,
                        id_sorteo,
                        url: `/?tipo=${tipo_juego}&sorteo=${id_sorteo}`
                    }
                };
                
                if (sub.tipo_notificacion === 'web') {
                    // Web Push API
                    await sendWebPush(sub.token, payload);
                } else {
                    // FCM (Android/iOS)
                    await sendFCM(sub.token, payload);
                }
                
                // Log de éxito
                await db`
                    INSERT INTO notificaciones_log (resultado_id, suscripcion_id, status)
                    VALUES ((SELECT id FROM resultados_juegos WHERE id_sorteo = ${id_sorteo} LIMIT 1), ${sub.id}, 'sent')
                `;
                
            } catch (error) {
                console.error(`Error enviando a ${sub.id}:`, error);
                
                // Log de error
                await db`
                    INSERT INTO notificaciones_log (resultado_id, suscripcion_id, status, error_message)
                    VALUES ((SELECT id FROM resultados_juegos WHERE id_sorteo = ${id_sorteo} LIMIT 1), ${sub.id}, 'failed', ${error.message})
                `;
            }
        });
        
        await Promise.all(promises);
        
        return new Response(JSON.stringify({ 
            success: true, 
            notificados: suscriptores.length 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } finally {
        await db.end();
    }
});

async function sendWebPush(token: string, payload: any) {
    // Implementar con web-push library
    // Requiere VAPID keys configuradas
    const webpush = await import('npm:web-push@3.6.6');
    
    await webpush.sendNotification(
        JSON.parse(token), // subscription object
        JSON.stringify(payload),
        {
            vapidDetails: {
                subject: 'mailto:your@email.com',
                publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
                privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!
            }
        }
    );
}

async function sendFCM(token: string, payload: any) {
    // Implementar con FCM API v1
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${Deno.env.get('FCM_PROJECT_ID')}/messages:send`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${await getFCMAccessToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: {
                token,
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: payload.data,
                android: {
                    priority: 'high'
                },
                apns: {
                    headers: {
                        'apns-priority': '10'
                    }
                }
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`FCM error: ${await response.text()}`);
    }
}

async function getFCMAccessToken(): Promise<string> {
    // Obtener token OAuth2 para FCM usando service account
    // Implementar según docs de Firebase Admin SDK
    // https://firebase.google.com/docs/cloud-messaging/auth-server
    return 'token_here'; // Placeholder
}
```

#### B. Frontend: Suscripción a Notificaciones

```javascript
// public/sw.js (Service Worker)
self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        data: data.data,
        actions: [
            { action: 'view', title: 'Ver Resultados' },
            { action: 'close', title: 'Cerrar' }
        ],
        requireInteraction: true
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});
```

```html
<!-- index.html: Botón de suscripción -->
<button id="subscribe-btn">🔔 Activar Notificaciones</button>

<script>
async function subscribeToPush() {
    // 1. Verificar soporte
    if (!('Notification' in window)) {
        alert('Tu navegador no soporta notificaciones');
        return;
    }
    
    // 2. Solicitar permiso
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert('Necesitamos permiso para enviarte notificaciones');
        return;
    }
    
    // 3. Registrar service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // 4. Suscribirse con VAPID public key
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('TU_VAPID_PUBLIC_KEY')
    });
    
    // 5. Enviar suscripción al backend
    await fetch('https://tu-api.supabase.co/functions/v1/subscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subscription,
            tipo_notificacion: 'web',
            juegos_suscritos: ['quiniela', 'loto'],  // Configurar según UI
            jurisdicciones_suscritas: ['BsAs', 'Ciudad']
        })
    });
    
    alert('¡Notificaciones activadas! 🎉');
}

document.getElementById('subscribe-btn').addEventListener('click', subscribeToPush);

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
</script>
```

---

### 5. UI/UX MODERNA

#### A. Estructura de la Aplicación

```
┌─────────────────────────────────────────┐
│           HEADER / NAV                  │
│  Logo | Juegos | Notificaciones | User  │
└─────────────────────────────────────────┘
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Filtros  │  │ Búsqueda │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   DASHBOARD DE JUEGOS           │   │
│  │                                 │   │
│  │  🎰 Quiniela (5 turnos hoy)    │   │
│  │  🎲 Poceada (1 sorteo hoy)     │   │
│  │  🎴 Tombolina (1 sorteo hoy)   │   │
│  │  🎯 Loto Plus (Próx: Miércoles)│   │
│  │  ⭐ Loto 5 Plus (Próx: Viernes)│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   RESULTADOS RECIENTES          │   │
│  │   (Cards responsivos)           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### B. Componentes Clave

##### 1. Dashboard Card
```html
<div class="game-card">
    <div class="game-header">
        <span class="game-icon">🎰</span>
        <span class="game-name">Quiniela BsAs</span>
        <span class="game-live">🔴 EN VIVO</span>
    </div>
    
    <div class="next-sorteo">
        Próximo sorteo: <strong>Nocturna</strong> a las <strong>21:00</strong>
        <div class="countdown">00:45:23</div>
    </div>
    
    <div class="last-result">
        <div class="result-label">Último resultado (Vespertina)</div>
        <div class="cabeza">8233</div>
        <div class="numeros-preview">3977 • 9193 • 1819 • ...</div>
        <button class="ver-completo">Ver Completo</button>
    </div>
</div>
```

##### 2. Modal de Resultado Completo
```html
<dialog id="resultado-modal">
    <div class="modal-header">
        <h2>🎰 Quiniela BsAs - Vespertina</h2>
        <span class="fecha">11/12/2025 - 18:00</span>
        <button class="close-btn">✕</button>
    </div>
    
    <div class="cabeza-section">
        <div class="label">A LA CABEZA</div>
        <div class="numero-grande">8233</div>
    </div>
    
    <div class="letras-section">
        <div class="label">LETRAS</div>
        <div class="letras">E • K • R • X</div>
    </div>
    
    <div class="extracto-completo">
        <div class="extracto-grid">
            <div class="num">1. 8233</div>
            <div class="num">2. 3977</div>
            <div class="num">3. 9193</div>
            <!-- ... 20 números ... -->
        </div>
    </div>
    
    <div class="actions">
        <button class="share-btn">📤 Compartir</button>
        <button class="download-btn">📥 Descargar</button>
    </div>
</dialog>
```

##### 3. Panel de Configuración de Notificaciones
```html
<div class="notif-panel">
    <h3>🔔 Configurar Notificaciones</h3>
    
    <div class="notif-section">
        <h4>Juegos</h4>
        <label><input type="checkbox" checked> Quiniela</label>
        <label><input type="checkbox"> Poceada</label>
        <label><input type="checkbox"> Tombolina</label>
        <label><input type="checkbox"> Loto Plus</label>
        <label><input type="checkbox"> Loto 5 Plus</label>
    </div>
    
    <div class="notif-section" id="quiniela-config">
        <h4>Jurisdicciones (Quiniela)</h4>
        <label><input type="checkbox" checked> Buenos Aires</label>
        <label><input type="checkbox"> Ciudad</label>
        <label><input type="checkbox"> Santa Fe</label>
        <label><input type="checkbox"> Córdoba</label>
        <label><input type="checkbox"> Entre Ríos</label>
    </div>
    
    <div class="notif-section">
        <h4>Turnos (Quiniela)</h4>
        <label><input type="checkbox"> La Previa</label>
        <label><input type="checkbox"> Primera</label>
        <label><input type="checkbox"> Matutina</label>
        <label><input type="checkbox"> Vespertina</label>
        <label><input type="checkbox" checked> Nocturna</label>
    </div>
    
    <button class="save-btn">💾 Guardar Preferencias</button>
</div>
```

#### C. Diseño Responsive

```css
/* Mobile First */
.game-card {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
    border: 2px solid #ffcc00;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.cabeza {
    font-size: 4rem;
    font-weight: 900;
    color: #ff0000;
    text-align: center;
    text-shadow: 0 0 20px rgba(255,0,0,0.5);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Tablet */
@media (min-width: 768px) {
    .resultados-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .resultados-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .dashboard {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 30px;
    }
    
    .sidebar {
        position: sticky;
        top: 20px;
    }
}
```

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### Fase 1: Fundaciones (Semana 1-2)
- [x] ✅ Quiniela funcionando (BsAs, Santa Fe, Córdoba)
- [ ] 🔄 Migrar DB al esquema unificado
- [ ] 🔄 Implementar API con cache
- [ ] 🔄 Crear UI base responsive

### Fase 2: Scrapers Adicionales (Semana 3)
- [ ] 📝 Scraper de Poceada
- [ ] 📝 Scraper de Tombolina
- [ ] 📝 Configurar GitHub Actions para todos los juegos
- [ ] 📝 Testing de reliability

### Fase 3: Notificaciones Push (Semana 4)
- [ ] 📝 Implementar Web Push API
- [ ] 📝 Service Worker
- [ ] 📝 Panel de suscripción en UI
- [ ] 📝 Edge Function para envío de notificaciones
- [ ] 📝 Testing en móviles

### Fase 4: Juegos Semanales (Semana 5)
- [ ] 📝 Scraper de Loto Plus
- [ ] 📝 Scraper de Loto 5 Plus
- [ ] 📝 UI específica para loterías (números diferentes)
- [ ] 📝 Sistema de pozo acumulado

### Fase 5: Optimizaciones y Features (Semana 6-7)
- [ ] 📝 Cache distribuido (considerar Redis)
- [ ] 📝 Estadísticas (números más salidos)
- [ ] 📝 Historial completo
- [ ] 📝 Share social media
- [ ] 📝 PWA (Progressive Web App)
- [ ] 📝 Dark/Light mode

### Fase 6: Expansión (Semana 8+)
- [ ] 📝 Ciudad y Entre Ríos (requiere investigar IDs propios)
- [ ] 📝 Otros juegos (Otra Chance, La Grande, etc)
- [ ] 📝 API pública documentada
- [ ] 📝 Dashboard de analytics

---

## 🚀 PRIORIDADES INMEDIATAS (MAÑANA)

### 1. **Migrar DB al nuevo esquema** (2-3 horas)
```bash
# Crear nueva tabla
supabase migration new unified_schema

# Migrar datos existentes
INSERT INTO resultados_juegos (tipo_juego, jurisdiccion, id_sorteo, fecha, turno, numeros, extras)
SELECT 'quiniela', jurisdiccion, id_sorteo::TEXT, fecha, turno, 
       numeros_oficiales, 
       jsonb_build_object('letras', letras_oficiales, 'cabeza', cabeza)
FROM quiniela_resultados;

# Eliminar tabla vieja (después de verificar)
DROP TABLE quiniela_resultados;
```

### 2. **Adaptar API actual** (1 hora)
- Cambiar queries para usar la nueva tabla
- Mantener compatibilidad con frontend actual

### 3. **Implementar Poceada Scraper** (2-3 horas)
- Analizar endpoint de Poceada
- Crear scraper similar al de Quiniela
- Configurar GitHub Action

### 4. **UI Dashboard básico** (3-4 horas)
- Layout con cards para cada juego
- Vista unificada de todos los resultados
- Filtros por tipo de juego

---

## 📊 MÉTRICAS DE PERFORMANCE

### Objetivos:
- ⚡ **API Response Time:** < 100ms (con cache), < 500ms (sin cache)
- 🚀 **Scraper Speed:** < 30s por juego (modo incremental)
- 📱 **Push Notification Latency:** < 2s después del sorteo
- 🎯 **Uptime:** 99.9%
- 💾 **DB Size:** < 1GB (con limpieza automática de 30 días)

### Monitoring:
- Supabase built-in analytics
- Edge Functions logs
- GitHub Actions execution times
- Push notification delivery rate

---

## 💰 COSTOS ESTIMADOS (Tier Gratuito)

| Servicio | Límite Gratis | Uso Estimado | ¿Suficiente? |
|----------|---------------|--------------|--------------|
| **Supabase DB** | 500 MB | ~100 MB/mes | ✅ Sí |
| **Edge Functions** | 2M invocations/mes | ~50K/mes | ✅ Sí |
| **GitHub Actions** | 2000 min/mes | ~300 min/mes | ✅ Sí |
| **Web Push** | Gratis | Unlimited | ✅ Sí |

**Conclusión:** Proyecto 100% gratuito durante primeros meses. Cuando escale, considerar:
- Supabase Pro ($25/mes)
- Redis Cloud (para cache distribuido, $0-10/mes)

---

## 🔐 SEGURIDAD Y COMPLIANCE

### Variables de Entorno Requeridas:
```bash
# Supabase
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=https://...

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
FCM_PROJECT_ID=...
FCM_SERVICE_ACCOUNT_JSON=...

# GitHub Actions
SUPABASE_ACCESS_TOKEN=...
```

### Buenas Prácticas:
- ✅ Todas las APIs públicas sin autenticación (solo lectura)
- ✅ Rate limiting en Edge Functions
- ✅ Sanitización de inputs
- ✅ CORS configurado correctamente
- ✅ HTTPS en todos los endpoints

---

## 📚 DOCUMENTACIÓN PARA EL USUARIO

### README.md
```markdown
# 🎰 Resultados de Lotería - Sistema Completo

Sistema de resultados en tiempo real para todos los juegos de Lotería de la Ciudad de Buenos Aires.

## 🎮 Juegos Soportados
- Quiniela (5 turnos diarios)
- Quiniela Poceada (diario)
- Tombolina (diario)
- Loto Plus (2x semana)
- Loto 5 Plus (semanal)

## 🚀 Inicio Rápido
1. Abre index.html
2. Activa notificaciones 🔔
3. ¡Listo!

## 📱 Features
- ⚡ Resultados en tiempo real
- 🔔 Notificaciones push
- 📊 Historial completo
- 🎨 Diseño moderno y responsive
- 🌙 Dark mode

## 🛠️ Tech Stack
- Frontend: HTML/CSS/JS (Vanilla)
- Backend: Supabase Edge Functions (Deno)
- DB: PostgreSQL
- Notifications: Web Push API
- Automation: GitHub Actions
```

---

## ✅ CHECKLIST FINAL PRE-LAUNCH

### Backend
- [ ] Todas las tablas creadas
- [ ] Todos los scrapers implementados
- [ ] GitHub Actions configurados
- [ ] Edge Functions desplegadas
- [ ] Secrets configurados
- [ ] Limpieza automática funcionando

### Frontend
- [ ] UI responsive (mobile/tablet/desktop)
- [ ] Service Worker registrado
- [ ] Notificaciones funcionando
- [ ] Todos los filtros operativos
- [ ] Error handling completo
- [ ] Loading states

### Testing
- [ ] Scrapers testeados con datos reales
- [ ] API con 100+ requests simultáneos
- [ ] Notificaciones en Chrome/Firefox/Safari
- [ ] Mobile testing (Android/iOS)
- [ ] Prueba de carga (stress test)

### DevOps
- [ ] Logs configurados
- [ ] Monitoring activo
- [ ] Backups automáticos
- [ ] Rollback plan

---

## 🎯 CONCLUSIÓN

Este es un **proyecto ambicioso pero totalmente factible**. El plan está diseñado para ser:

1. **Escalable:** Arquitectura que soporta agregar nuevos juegos fácilmente
2. **Performante:** Cache, índices DB, y Edge Functions para latencia mínima
3. **Gratuito:** Aprovecha tiers gratuitos de Supabase y GitHub
4. **Moderno:** Web Push, PWA, responsive design
5. **Mantenible:** Código limpio, documentado, y con buenas prácticas

### Próximos Pasos Inmediatos (Mañana):
1. ☕ Café
2. 🔄 Migrar DB al esquema unificado
3. 🎲 Implementar Poceada scraper
4. 🎨 Crear UI dashboard básico
5. 📱 Prototipo de notificaciones

**Tiempo estimado para MVP completo: 2-3 semanas**  
**Tiempo para versión 1.0 full: 6-8 semanas**

---

*Documento creado: 12 de Diciembre 2025, 00:25 AM*  
*Revisión: v1.0*  
*Autor: AI Assistant con análisis exhaustivo* 🤖


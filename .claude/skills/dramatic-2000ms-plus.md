---
name: dramatic-2000ms-plus
description: Crea animaciones de impacto de larga duración (2000ms+) para momentos clave — pantallas de carga iniciales, confirmaciones de pago exitoso, transiciones entre estados mayores y empty states con narrativa visual.
user_invocable: true
---

Eres un Director de Animación para interfaces. Diseñas momentos de impacto dramático que marcan hitos en el flujo del usuario. No todo merece 200ms — los momentos que importan merecen 2 segundos o más de atención visual.

## Cuándo usar animaciones dramáticas

Solo para **momentos de alto significado**:
- Splash/loading inicial de la app
- Confirmación de pago exitoso
- Cambio de estado mayor (RECIBIDO → PAGADO en vista rápida)
- Primera carga del dashboard con datos
- Error crítico / estado de desconexión
- Celebración (hito de ventas, mesa libre)

NUNCA para: hover, scroll, transiciones de tab, inputs, botones normales.

## Patrones dramáticos

### 1. Splash Screen de la app (3000ms)
```css
@keyframes splashLogo {
  0% { opacity: 0; transform: scale(0.5); filter: blur(20px); }
  40% { opacity: 1; transform: scale(1.05); filter: blur(0); }
  60% { transform: scale(1); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.1); filter: blur(10px); }
}

@keyframes splashText {
  0%, 30% { opacity: 0; transform: translateY(20px); }
  50% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes splashBg {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; pointer-events: none; }
}
```

### 2. Confirmación de pago (2500ms)
Secuencia:
```
0ms     → Overlay oscuro fade-in
200ms   → Círculo de check scale-in desde centro
500ms   → Stroke del checkmark se dibuja
800ms   → Texto "Pago confirmado" text-reveal
1200ms  → Monto aparece con counter animation
1800ms  → Confetti particles (CSS only)
2500ms  → Todo fade-out y vuelve al flujo
```

```css
@keyframes confetti {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-200px) rotate(720deg) scale(0);
  }
}

.confetti-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confetti 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.confetti-particle:nth-child(1) { left: 20%; animation-delay: 0ms; background: var(--accent-blue); }
.confetti-particle:nth-child(2) { left: 35%; animation-delay: 100ms; background: var(--accent-emerald); }
.confetti-particle:nth-child(3) { left: 50%; animation-delay: 50ms; background: var(--accent-purple); }
.confetti-particle:nth-child(4) { left: 65%; animation-delay: 150ms; background: var(--accent-yellow); }
.confetti-particle:nth-child(5) { left: 80%; animation-delay: 80ms; background: var(--accent-blue); }
```

### 3. Transición de estado mayor (2000ms)
Cuando una comanda va de RECIBIDO a PAGADO (vista rápida resumen):
```css
@keyframes stateTransition {
  0% {
    background: var(--color-from);
    transform: scale(1);
    box-shadow: 0 0 0 0 var(--color-from);
  }
  30% {
    transform: scale(1.02);
    box-shadow: 0 0 30px 10px var(--glow);
  }
  50% {
    background: var(--color-to);
  }
  70% {
    transform: scale(1);
  }
  100% {
    background: var(--color-to);
    box-shadow: 0 0 0 0 transparent;
  }
}
```

### 4. Empty state narrativo (loop 4000ms)
Para cuando no hay comandas:
```
0ms     → Icono de mesa aparece (scale-in)
500ms   → Mesa "respira" (scale pulse suave)
1000ms  → Texto aparece letra por letra
2000ms  → CTA button fade-up con bounce
3000ms  → Sutil particle float alrededor
4000ms  → Loop del breathe
```

### 5. Conexión perdida / reconectando (loop 3000ms)
```css
@keyframes radarPulse {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
    border-width: 3px;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
    border-width: 1px;
  }
}

.radar {
  position: relative;
}
.radar::before,
.radar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--accent-blue);
  animation: radarPulse 2s ease-out infinite;
}
.radar::after {
  animation-delay: 1s;
}
```

### 6. Dashboard first-load reveal (3000ms)
Secuencia tipo "broadcast opening":
```
0ms     → Background gradient shift empieza
200ms   → Logo marca en centro (scale + blur reveal)
800ms   → Logo sube arriba, header se forma
1000ms  → KPI cards entran una a una (stagger 200ms)
1600ms  → Gráfico se "dibuja" de izquierda a derecha
2200ms  → Tabla rows caen en cascada
3000ms  → Todo settling, micro-animations residuales
```

## Reglas

1. **Máximo 1 animación dramática por flujo de usuario**. No compitas por atención.
2. **Siempre skipeable**: Si dura >1.5s, el usuario debe poder hacer click para saltar.
3. **No bloquear interacción**: Las animaciones dramáticas son overlay, no bloquean el contenido debajo.
4. **Performance**: Usa `will-change: transform, opacity` solo durante la animación, quítalo después.
5. **Prefers-reduced-motion**: Estas animaciones se ELIMINAN completamente (no se reducen) con esta media query.
6. **Una vez**: Usa sessionStorage para no repetir splash/reveal en la misma sesión.

## Cómo actuar

1. Identifica los 2-3 momentos de máximo impacto en el flujo actual
2. Diseña la secuencia completa con timeline exacta
3. Implementa con CSS keyframes + delays escalonados
4. Agrega mecanismo de skip y prefers-reduced-motion
5. Asegura que no degrade performance (60fps siempre)

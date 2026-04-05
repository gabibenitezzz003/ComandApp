---
name: human-touch-polish
description: El 5% final que diferencia diseno humano de IA — detalles imperceptibles que crean calidez, imperfeccion intencional, micro-sorpresas, estados completos, y el pulido obsesivo que hace que todo se sienta artesanal.
user_invocable: true
---

Eres el Director Creativo haciendo la revision final antes de lanzar. Tu ojo esta entrenado para detectar los 47 detalles que separan "bueno" de "increible". No agregas features — pules lo que existe hasta que brille.

## La diferencia invisible

Un usuario nunca dira "me gustan las sombras inset de las cards". Pero dira "esta app se siente premium" o "esto se siente bien". Esa sensacion viene de docenas de micro-decisiones que NO se notan individualmente pero se SIENTEN en conjunto.

## Checklist del 5% final

### Cursor y seleccion

```css
/* Cursor contextual */
button, [role="button"], a { cursor: pointer; }
[disabled] { cursor: not-allowed; }
input, textarea { cursor: text; }
.draggable { cursor: grab; }
.dragging { cursor: grabbing; }

/* Seleccion de texto con color de marca */
::selection {
  background: rgba(79, 142, 247, 0.3);
  color: var(--text-primary);
}
```

### Scrollbar custom

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

### Focus visible (accesibilidad que se ve bien)

```css
:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
  border-radius: inherit;
}

/* Quitar outline feo del click, mantener para teclado */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Transiciones universales suaves

```css
*, *::before, *::after {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-duration: 0.15s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Excepciones: elementos que se animan explicitamente */
[class*="animate-"], .no-transition {
  transition: none;
}
```

### Tap highlight en mobile

```css
@media (hover: none) {
  button, a, [role="button"] {
    -webkit-tap-highlight-color: rgba(79, 142, 247, 0.1);
  }
}
```

### Loading states completos

Cada boton que hace una accion async necesita 4 estados visibles:

```
1. IDLE:     "Enviar pedido"
2. LOADING:  [spinner] "Enviando..."   ← Texto cambia + spinner
3. SUCCESS:  [checkmark] "Enviado!"    ← Feedback positivo, 1.5s
4. ERROR:    [X] "Error, reintenta"    ← Con accion clara
→ Vuelve a IDLE despues de success/error
```

### Placeholder con personalidad

```
Input email:    "tu@email.com"
Input clave:    "Minimo 6 caracteres"
Input buscar:   "Buscar en el menu..."
Textarea notas: "Sin cebolla, extra limon..."
Textarea obs:   "Alergias, preferencias..."
```

Nunca "Ingrese su email" — es redundante con el label.

### Numeros formateados SIEMPRE

```tsx
// Mal
<span>{total}</span>

// Bien
<span>${total.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</span>

// Cantidades
<span>{cantidad.toLocaleString("es-AR")}</span>
```

### Truncamiento inteligente

```css
.truncar-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truncar-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

Siempre con `title` attribute para tooltip nativo:
```tsx
<span className="truncar-1" title={textoCompleto}>{textoCompleto}</span>
```

### Smooth scroll

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

### Accesibilidad reducida de movimiento

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Hover states que se sienten vivos

```css
/* Card hover: elevacion + borde + glow sutil */
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Button hover: brightness, no color change */
.btn:hover {
  filter: brightness(1.1);
}

/* Link hover: underline que aparece */
.link {
  text-decoration: none;
  background-image: linear-gradient(var(--accent-blue), var(--accent-blue));
  background-size: 0% 1px;
  background-position: left bottom;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
}
.link:hover {
  background-size: 100% 1px;
}

/* Row hover: highlight MUY sutil */
tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}
```

### Micro-sorpresas

Detalles que hacen sonreir:

1. **Counter bounce**: Cuando se agrega item al carrito, el numero hace un scale bounce
```css
@keyframes counterBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
```

2. **Check que se dibuja**: Al completar una accion, el checkmark se dibuja stroke por stroke

3. **Toast que entra con spring**: Las notificaciones entran con overshoot
```css
@keyframes toastIn {
  0% { transform: translateX(100%) scale(0.8); opacity: 0; }
  70% { transform: translateX(-5%); }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
```

4. **Skeleton con shimmer**: Loading placeholders que brillan sutilmente

### Favicon y meta tags

```html
<meta name="theme-color" content="#08080d" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### Performance perceptual

- Usar `content-visibility: auto` en secciones largas
- Usar `loading="lazy"` en imagenes
- Skeleton loading en vez de spinners para contenido principal
- Optimistic UI: actualizar la UI antes de la respuesta del server

### Detalle final: favicon que cambia con notificaciones

```tsx
// Cuando hay comandas nuevas, el favicon muestra un dot
function actualizarFavicon(hayNuevas: boolean) {
  const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  link.href = hayNuevas ? "/favicon-notif.svg" : "/favicon.svg";
}
```

## Anti-patrones del "ultimo 5%" que gritan AI

- Buttons sin hover state (se sienten muertos)
- Click en boton y NADA pasa visualmente durante 2 segundos
- Scrollbar del browser por defecto en dark theme (gris brillante)
- Texto seleccionable con highlight azul del OS
- Focus outline naranja/azul del browser por defecto
- Numeros sin formato ("12500" en vez de "$12.500")
- Placeholder que dice "Ingrese su..." (redundante y robotico)
- Loading state que es solo "Cargando..." sin contexto
- Error que dice "Error" sin explicar que paso ni que hacer

## Como actuar

1. Recorre CADA elemento interactivo y verifica: hover, active, focus, disabled, loading
2. Aplica scrollbar custom, selection color, cursor contextual
3. Verifica que TODOS los numeros estan formateados
4. Verifica que cada accion async tiene 4 estados (idle, loading, success, error)
5. Aplica prefers-reduced-motion
6. Agrega title tooltips a textos truncados
7. Verifica placeholders con personalidad
8. Busca oportunidades de micro-sorpresa (1-2 max, no exagerar)

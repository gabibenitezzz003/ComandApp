---
name: apple-ui-skills
description: Aplica lenguaje de diseño Apple-like — glassmorphism, blur, profundidad sutil, tipografía con peso, espaciado generoso, bordes ultra-finos y paleta restringida con acentos vivos.
user_invocable: true
---

Eres un diseñador UI que domina el lenguaje visual de Apple. Transformas interfaces en experiencias premium con profundidad, claridad y refinamiento extremo.

## Filosofía de diseño

1. **Contenido primero**: La UI desaparece. El contenido respira. Espaciado generoso.
2. **Profundidad con sutileza**: Capas con blur, no con sombras pesadas.
3. **Tipografía como jerarquía**: El peso tipográfico guía el ojo, no los colores brillantes.
4. **Paleta restringida**: Fondo neutro, texto en escala de grises, acentos vivos solo para CTAs y estados.
5. **Micro-detalles**: Bordes de 1px semi-transparentes, radios generosos (12-20px), transiciones imperceptibles.

## Sistema de diseño dark premium

### Variables CSS obligatorias
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a25;
  --bg-elevated: rgba(255, 255, 255, 0.03);
  --bg-hover: rgba(255, 255, 255, 0.06);

  --text-primary: #f0f0f5;
  --text-secondary: #a0a0b0;
  --text-muted: #606070;

  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.1);

  --accent-blue: #4f8ef7;
  --accent-emerald: #34d399;
  --accent-orange: #f97316;
  --accent-purple: #a78bfa;
  --accent-red: #f87171;
  --accent-yellow: #fbbf24;

  --glass-bg: rgba(18, 18, 26, 0.8);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 20px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.5);
  --shadow-glow-blue: 0 0 20px rgba(79, 142, 247, 0.15);
  --shadow-glow-emerald: 0 0 20px rgba(52, 211, 153, 0.15);

  --font-body: 'Inter', -apple-system, system-ui, sans-serif;
  --font-heading: 'Outfit', 'Inter', sans-serif;
}
```

### Glass card (componente base)
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}
```

### Tarjeta elevada
```css
.card-elevated {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-elevated:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Botón primario Apple-style
```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent-blue), #6366f1);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(79, 142, 247, 0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(79, 142, 247, 0.4);
}
.btn-primary:active {
  transform: translateY(0) scale(0.98);
}
```

## Reglas tipográficas

| Elemento | Font | Weight | Size | Color |
|----------|------|--------|------|-------|
| H1 | Outfit | 900 | 2rem | --text-primary |
| H2 | Outfit | 700 | 1.5rem | --text-primary |
| H3 | Outfit | 700 | 1.125rem | --text-primary |
| Body | Inter | 400 | 0.9375rem | --text-secondary |
| Caption | Inter | 500 | 0.75rem | --text-muted |
| KPI number | Outfit | 900 | 2.5rem | accent color |
| Badge | Inter | 600 | 0.6875rem | depends |

## Espaciado

- Entre secciones: 2rem-3rem
- Padding de cards: 1.25rem-1.5rem
- Gap entre items: 0.75rem-1rem
- Padding de botones: 0.625rem 1.25rem

## Patrones Apple obligatorios

1. **Dividers**: Nunca `border-bottom` sólido. Usa `<hr>` con gradiente radial que desaparece en los bordes.
2. **Inputs**: Fondo `--bg-elevated`, borde `--border-subtle`, foco con glow del accent color.
3. **Tablas**: Sin bordes entre celdas. Filas con hover `--bg-hover`. Header con texto `--text-muted` uppercase tracking-wider.
4. **Badges de estado**: Fondo semi-transparente del color + texto saturado + borde 1px del color al 20%.
5. **Scroll**: Custom scrollbar ultra-fino (4px, track transparente, thumb `--border-medium`).

## Cómo actuar

1. Aplica las CSS variables en `globals.css`
2. Reemplaza todos los colores hardcodeados por variables
3. Aplica `glass` a contenedores principales, `card-elevated` a tarjetas
4. Usa `Outfit` para headings y números, `Inter` para body text
5. Asegura que todo el dark theme sea coherente sin colores de Tailwind default

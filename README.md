# ⚡ ComandApp — Sistema POS Premium de Comandas QR

![ComandApp Banner](https://img.shields.io/badge/Status-Project%20In%20Development-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express-4-lightgrey?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io)

**ComandApp** es una solución integral de gestión para restaurantes que transforma la experiencia de pedido tradicional en un ecosistema digital ultra-rápido y visualmente impactante. Diseñado con una estética **Premium Dark Mode**, ofrece un simulador de salón interactivo con efectos neón y notificaciones en tiempo real.

---

## ✨ Características Principales

### 🖥️ Dashboard Administrativo "RestoGlow"
*   **Simulador Interactivo de Mesas**: Mapa del salón con estados dinámicos (Rojo: Acción requerida, Verde: Consumiendo, Gris: Standby).
*   **Efectos Neón & Glassmorphism**: Interfaz diseñada para alta visibilidad en entornos oscuros (restaurantes/pubs) con sombras luminosas que palpitan según el estado.
*   **Asignación de Mozos Live**: Gestión dinámica de personal por mesa mediante arrastre o selección rápida en sidebar.
*   **Detalle de Consumo Profundo**: Visualización instantánea de cada plato pedido, precios unitarios y subtotal por comanda.

### 🤵 Panel del Mozo Inteligente
*   **Notificaciones Push con Audio**: Alertas instantáneas ("Ding" acústico) cuando una comanda está lista para ser servida.
*   **Gestión de Estados**: Flujo completo desde *Recibido* hasta *Pagado* con validación de acciones.
*   **Sincronización Multi-dispositivo**: Todos los mozos ven los cambios en milisegundos gracias a WebSockets.

### 📱 Experiencia del Cliente (QR)
*   **Pedido sin Fricciones**: Escaneo de QR único por mesa que abre el menú digital (sin necesidad de apps externas).
*   **Estado del Pedido Online**: El cliente ve en tiempo real cuando su pedido está "En Preparación" o "En Camino".

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Next.js (App Router), Tailwind CSS, Zustand, Sonner, Socket.io-client |
| **Backend** | Node.js, Express, Socket.io, TypeScript |
| **Persistencia** | PostgreSQL (Supabase), Prisma ORM |
| **Infraestructura** | Web Audio API (Notificaciones), JWT (Seguridad) |

---

## 🚀 Guía de Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/gabibenitezzz003/ComandApp.git
cd ComandApp
```

### 2. Configuración del Backend
```bash
cd backend
npm install
# Configura tu .env con DATABASE_URL y JWT_SECRET
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Configuración del Frontend
```bash
cd ../frontend
npm install
npm run dev -- --port 3000
```

---

## 📸 Demo Visual

> [!TIP]
> El sistema utiliza **notificaciones de audio sintetizadas** para garantizar que ningún pedido se pase por alto en momentos de alta demanda.

*(Aquí irían los activos visuales del proyecto)*

---

## 👨‍💻 Autor
**Gabriel Benitez** — Full Stack Developer
[GitHub Profile](https://github.com/gabibenitezzz003)

---
© 2024 ComandApp. Todos los derechos reservados.

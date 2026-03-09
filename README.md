# 🎴 Pokémon TCG Simulator

Una aplicación web moderna para abrir sobres virtuales de cartas Pokémon TCG, coleccionar cartas y disfrutar de la experiencia del trading card game de forma digital.

## ✨ Características

- **🎴 Abre Sobres Virtuales**: Simula la apertura de sobres con probabilidades realistas
- **📚 Colecciona Cartas**: Guarda todas las cartas que abres en tu colección personal
- **🗂️ Múltiples Sets**: Acceso a todas las expansiones desde Base Set hasta Scarlet & Violet
- **📊 Estadísticas Detalladas**: Sigue tu progreso y colecciones por set
- **🎨 Tema Claro/Oscuro**: Personaliza la interfaz según tus preferencias
- **🔐 Autenticación Segura**: Sincroniza tu colección entre dispositivos con Supabase
- **⚡ Alto Rendimiento**: Caché inteligente y optimizaciones para carga rápida
- **📱 Responsive**: Funciona perfectamente en desktop, tablet y móvil

## 🚀 Instalación

### Requisitos
- Node.js 18+ 
- npm o yarn
- API Key de Pokémon TCG (gratuita en https://pokemontcg.io/)

### Pasos

1. **Clona el repositorio**
```bash
git clone https://github.com/ItsNecrox/PokemonTCG_WebSimulator.git
cd pack-simulator
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
```bash
cp .env.example .env.local
```

4. **Completa .env.local**
```env
# Pokemon TCG API (gratuita)
NEXT_PUBLIC_POKEMON_API_KEY=your_api_key_here

# Supabase (opcional, para autenticación)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

5. **Ejecuta el servidor de desarrollo**
```bash
npm run dev
```

6. **Abre en tu navegador**
```
http://localhost:3000
```

## 📖 Uso

### Página Principal
- Dashboard con tus estadísticas principales
- Resumen de tu colección
- Acceso rápido a todas las funciones

### 🎴 Abrir Sobres
1. Navega a la sección "Sobres"
2. Selecciona una generación/serie
3. Elige el set del que deseas abrir un sobre
4. Haz clic en "Abrir Sobre"
5. ¡Espera la animación y obtén tus cartas!

### 📚 Mi Colección
- Visualiza todas las cartas que has recolectado
- Filtra por rareza, set o tipo
- Busca cartas específicas
- Ve detalles completos de cada carta

### 🗂️ Sets
- Explora todos los sets disponibles
- Ve qué cartas faltan en tu colección
- Progreso de colección por set

### 📊 Estadísticas
- Gráficos detallados de tu colección
- Distribución por rareza
- Análisis de progreso

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Defecto |
|----------|-------------|---------|
| `NEXT_PUBLIC_POKEMON_API_KEY` | API Key de Pokémon TCG | Requerido |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | Opcional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Opcional |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Timeout de API en ms | 10000 |
| `NEXT_PUBLIC_API_RETRY_ATTEMPTS` | Intentos de reconexión | 3 |
| `NEXT_PUBLIC_ENABLE_TRADING` | Activar trading (feature flag) | false |
| `NEXT_PUBLIC_ENABLE_RANKING` | Activar ranking (feature flag) | false |
| `NEXT_PUBLIC_ENABLE_MISSIONS` | Activar misiones (feature flag) | false |

### Estructura del Proyecto

```
pack-simulator/
├── app/                      # Rutas y páginas de Next.js
│   ├── page.tsx             # Página principal
│   ├── packs/               # Simulador de sobres
│   ├── collection/          # Mi colección
│   ├── sets/                # Explorador de sets
│   ├── stats/               # Estadísticas
│   └── auth/                # Autenticación
├── components/              # Componentes React reutilizables
│   ├── Card.tsx             # Componente de tarjeta (memoizado)
│   ├── Navbar.tsx           # Navegación principal
│   ├── AuthContext.tsx      # Contexto de autenticación
│   ├── CollectionContext.tsx# Contexto de colección (centralizado)
│   ├── ThemeContext.tsx     # Contexto de temas
│   └── ToastProvider.tsx    # Notificaciones
├── lib/                     # Utilidades y servicios
│   ├── pokemonTcgApi.ts     # Cliente API con retry y caché
│   ├── packSimulator.ts     # Lógica de simulación de sobres
│   ├── storage.ts           # Persistencia localStorage
│   ├── logger.ts            # Sistema de logging centralizado
│   └── auth.ts              # Autenticación con Supabase
├── types/                   # Tipos TypeScript
│   └── pokemon.ts           # Tipos de cartas y sets
└── public/                  # Archivos estáticos
```

## 🎯 Probabilidades de Rarezas

La simulación de sobres utiliza probabilidades realistas del juego:

- **Común**: 65% - 70%
- **Poco Común**: 20% - 25%
- **Rara**: 5% - 8%
- **Rara Holo**: 3% - 5%
- **Ultra Rara**: 1% - 2%
- **Rara Ilustración**: 0.5% - 1%

## 🔒 Seguridad

- ✅ API Key nunca se expone en el navegador (usa variables de entorno)
- ✅ Almacenamiento seguro en localStorage con serialización
- ✅ Autenticación opcional con Supabase
- ✅ Rate limiting de API implementado
- ✅ Validación de datos en cliente y servidor

## 🚀 Optimizaciones

- **Caché inteligente**: Los sets y cartas se cachean durante 24 horas
- **Memoización**: Componentes de tarjeta memoizados para evitar re-renders
- **Lazy loading**: Imágenes se cargan bajo demanda
- **Retry logic**: Reconexión automática con backoff exponencial
- **Compresión**: CSS y JavaScript optimizados para producción

## 📱 Mobile

- Interfaz completamente responsiva
- Gestos touch optimizados
- Carga rápida incluso en conexiones lentas
- Acceso offline a colección almacenada

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Sistema de trading entre usuarios
- [ ] Misiones y objetivos
- [ ] Leaderboard global
- [ ] Exportar colección a PDF
- [ ] Sincronización en tiempo real
- [ ] Modo multijugador
- [ ] Análisis IA de colecciones

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue con:
- Descripción del problema
- Pasos para reproducir
- Screenshots (si aplica)
- Tu navegador y versión

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Pokémon TCG API](https://pokemontcg.io/) por proporcionar los datos
- [Next.js](https://nextjs.org/) por el framework
- [Supabase](https://supabase.io/) por la autenticación
- Comunidad Pokémon TCG

## 📧 Contacto

- GitHub: [@ItsNecrox](https://github.com/ItsNecrox)
- Issues: [GitHub Issues](https://github.com/ItsNecrox/PokemonTCG_WebSimulator/issues)

---

**¡Disfruta coleccionando!** 🎴✨

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

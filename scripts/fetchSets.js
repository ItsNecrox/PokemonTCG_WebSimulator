// Script para descargar todos los sets de la API y guardarlos localmente
// Ejecutar: node scripts/fetchSets.js

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = 'a189b0f5-8f58-4e2c-b93c-d6b496d3cfd1';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'sets.json');

async function fetchAllSets() {
    console.log('🔄 Descargando todos los sets de la API...');
    
    try {
        const response = await fetch(`${API_BASE}/sets?orderBy=-releaseDate`, {
            headers: {
                'X-Api-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const sets = data.data || [];

        console.log(`✅ Descargados ${sets.length} sets`);

        // Crear directorio si no existe
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Guardar en archivo
        fs.writeFileSync(
            OUTPUT_FILE,
            JSON.stringify({
                data: sets,
                lastUpdated: new Date().toISOString(),
                totalSets: sets.length
            }, null, 2)
        );

        console.log(`💾 Guardado en: ${OUTPUT_FILE}`);
        console.log(`📊 Total de sets: ${sets.length}`);
        console.log('✨ ¡Listo! Ahora la app cargará instantáneamente');

        return sets;
    } catch (error) {
        console.error('❌ Error al descargar sets:', error);
        throw error;
    }
}

// Ejecutar
fetchAllSets()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// Script mejorado para descargar TODAS las cartas de TODOS los sets
// Ejecutar: node scripts/fetchAllData.js

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = 'a189b0f5-8f58-4e2c-b93c-d6b496d3cfd1';
const SETS_FILE = path.join(__dirname, '..', 'public', 'data', 'sets.json');
const CARDS_DIR = path.join(__dirname, '..', 'public', 'data', 'cards');

// Configuración agresiva para manejar API lenta
const TIMEOUT_MS = 60000; // 60 segundos
const MAX_RETRIES = 5; // 5 intentos
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requests

// Helper: Esperar X milisegundos
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Fetch con timeout y reintentos
async function fetchWithRetry(url, attempt = 1) {
    console.log(`  [Intento ${attempt}/${MAX_RETRIES}] ${url}`);
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
            headers: { 'X-Api-Key': API_KEY },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (attempt < MAX_RETRIES) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            console.log(`  ⚠️  Error: ${error.message}. Reintentando en ${backoffMs/1000}s...`);
            await sleep(backoffMs);
            return fetchWithRetry(url, attempt + 1);
        }
        throw error;
    }
}

// 1. Descargar todos los sets
async function downloadSets() {
    console.log('\n📦 PASO 1: Descargando todos los sets...\n');
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/sets?orderBy=-releaseDate`);
        const sets = data.data || [];

        // Crear directorio si no existe
        const dir = path.dirname(SETS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Guardar sets
        fs.writeFileSync(
            SETS_FILE,
            JSON.stringify({
                data: sets,
                lastUpdated: new Date().toISOString(),
                totalSets: sets.length
            }, null, 2)
        );

        console.log(`✅ Descargados ${sets.length} sets`);
        console.log(`💾 Guardados en: ${SETS_FILE}\n`);

        return sets;
    } catch (error) {
        console.error('❌ Error descargando sets:', error.message);
        throw error;
    }
}

// 2. Descargar todas las cartas de un set
async function downloadCardsForSet(set, index, total) {
    console.log(`\n🃏 [${index + 1}/${total}] ${set.name} (${set.id})`);
    console.log(`   Total de cartas: ${set.total}`);
    
    try {
        // Descargar TODAS las cartas (pageSize=250 es el máximo)
        const data = await fetchWithRetry(
            `${API_BASE}/cards?q=set.id:${set.id}&pageSize=250`
        );
        
        const cards = data.data || [];
        
        // Crear directorio si no existe
        if (!fs.existsSync(CARDS_DIR)) {
            fs.mkdirSync(CARDS_DIR, { recursive: true });
        }

        // Guardar cartas del set
        const outputFile = path.join(CARDS_DIR, `${set.id}.json`);
        fs.writeFileSync(
            outputFile,
            JSON.stringify({
                data: cards,
                set: {
                    id: set.id,
                    name: set.name,
                    series: set.series,
                    total: set.total
                },
                lastUpdated: new Date().toISOString(),
                totalCards: cards.length
            }, null, 2)
        );

        console.log(`   ✅ Descargadas ${cards.length} cartas`);
        console.log(`   💾 Guardadas en: ${outputFile}`);

        // Esperar antes del siguiente request para no saturar la API
        await sleep(DELAY_BETWEEN_REQUESTS);

        return { success: true, setId: set.id, count: cards.length };
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return { success: false, setId: set.id, error: error.message };
    }
}

// 3. Descargar todas las cartas de todos los sets
async function downloadAllCards(sets) {
    console.log(`\n🎴 PASO 2: Descargando cartas de ${sets.length} sets...\n`);
    console.log(`⚠️  Esto puede tardar varios minutos. Por favor espera...\n`);

    const results = [];

    for (let i = 0; i < sets.length; i++) {
        const result = await downloadCardsForSet(sets[i], i, sets.length);
        results.push(result);
    }

    return results;
}

// 4. Resumen final
function printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60) + '\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Sets exitosos: ${successful.length}`);
    console.log(`❌ Sets fallidos: ${failed.length}`);
    
    if (successful.length > 0) {
        const totalCards = successful.reduce((sum, r) => sum + r.count, 0);
        console.log(`🎴 Total de cartas descargadas: ${totalCards}`);
    }

    if (failed.length > 0) {
        console.log('\nSets que fallaron:');
        failed.forEach(r => {
            console.log(`  - ${r.setId}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    
    if (failed.length === 0) {
        console.log('🎉 ¡TODO DESCARGADO EXITOSAMENTE!');
        console.log('🚀 Ahora tu simulador funciona 100% sin depender de la API');
    } else {
        console.log('⚠️  Algunos sets fallaron. Puedes reintentar el script más tarde.');
    }
    console.log('='.repeat(60) + '\n');
}

// EJECUTAR TODO
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 DESCARGADOR COMPLETO DE PÓKEMON TCG');
    console.log('='.repeat(60));
    console.log('\nEsto descargará:');
    console.log('  1. Todos los sets disponibles');
    console.log('  2. TODAS las cartas de cada set');
    console.log('\nConfiguración:');
    console.log(`  - Timeout por request: ${TIMEOUT_MS/1000}s`);
    console.log(`  - Reintentos máximos: ${MAX_RETRIES}`);
    console.log(`  - Delay entre requests: ${DELAY_BETWEEN_REQUESTS/1000}s`);
    console.log('='.repeat(60));

    try {
        const sets = await downloadSets();
        const results = await downloadAllCards(sets);
        printSummary(results);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error.message);
        process.exit(1);
    }
}

main();

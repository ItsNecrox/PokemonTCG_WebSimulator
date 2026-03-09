const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_BASE = 'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const SETS_FILE = path.join(OUTPUT_DIR, 'sets.json');
const CARDS_DIR = path.join(OUTPUT_DIR, 'cards');

// Helper para descargar JSON desde URL
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`Request Failed. Status Code: ${res.statusCode} for ${url}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

async function main() {
    console.log('🚀 Iniciando descarga desde GitHub...');

    // 1. Crear directorios
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(CARDS_DIR)) fs.mkdirSync(CARDS_DIR, { recursive: true });

    try {
        // 2. Descargar Sets
        console.log('📦 Descargando Sets...');
        const setsData = await fetchJson(`${GITHUB_BASE}/sets/en.json`);
        
        // El formato de GitHub es un array directo, la API devuelve { data: [...] }
        // Adaptamos al formato que espera la app
        const formattedSets = {
            data: setsData, // Los sets de GitHub ya tienen la estructura correcta
            lastUpdated: new Date().toISOString(),
            totalSets: setsData.length
        };

        fs.writeFileSync(SETS_FILE, JSON.stringify(formattedSets, null, 2));
        console.log(`✅ ${setsData.length} sets guardados en sets.json`);

        // 3. Descargar Cartas por Set
        console.log('🎴 Descargando Cartas por Set...');
        
        let successCount = 0;
        let errorCount = 0;

        for (const set of setsData) {
            const setId = set.id;
            console.log(`   ⬇️  Descargando ${set.name} (${setId})...`);
            
            try {
                const cardsData = await fetchJson(`${GITHUB_BASE}/cards/en/${setId}.json`);
                
                // Formato esperado por la app: { data: [cards], ... }
                const formattedCards = {
                    data: cardsData,
                    set: {
                        id: set.id,
                        name: set.name,
                        series: set.series,
                        total: set.total
                    },
                    lastUpdated: new Date().toISOString(),
                    totalCards: cardsData.length
                };

                fs.writeFileSync(path.join(CARDS_DIR, `${setId}.json`), JSON.stringify(formattedCards, null, 2));
                successCount++;
            } catch (err) {
                console.error(`   ❌ Error descargando ${setId}: ${err.message}`);
                errorCount++;
            }
            
            // Pequeña pausa para no saturar conexiones locales
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n' + '='.repeat(40));
        console.log(`🎉 Finalizado!`);
        console.log(`✅ Sets descargados: ${successCount}`);
        console.log(`❌ Sets fallidos: ${errorCount}`);
        console.log('='.repeat(40));

    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

main();

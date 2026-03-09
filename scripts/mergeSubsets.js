const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const SETS_FILE = path.join(DATA_DIR, 'sets.json');
const CARDS_DIR = path.join(DATA_DIR, 'cards');

function main() {
    console.log('🚀 Iniciando proceso de unificación de subsets...');

    if (!fs.existsSync(SETS_FILE)) {
        console.error('❌ No se encuentra sets.json');
        return;
    }

    const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));
    const sets = setsData.data;
    
    // 1. Identificar subsets (terminan en 'tg', 'gg', 'sv', 'c', etc)
    const subsets = sets.filter(s => 
        s.id.endsWith('tg') || 
        s.id.endsWith('gg') || 
        s.id.endsWith('sv') || 
        s.id.endsWith('shswtg') || 
        s.id === 'sma' || // Hidden Fates Shiny Vault
        s.id === 'cel25c' || // Celebrations Classic Collection
        s.name.includes('Gallery') ||
        s.name.includes('Shiny Vault') ||
        s.name.includes('Classic Collection')
    );

    console.log(`🔍 Encontrados ${subsets.length} posibles subsets.`);

    const mergedSetIds = new Set();
    const setsToRemove = new Set();

    for (const subset of subsets) {
        // Intentar encontrar el set padre
        let parentId = '';
        if (subset.id.endsWith('tg')) parentId = subset.id.replace('tg', '');
        else if (subset.id.endsWith('gg')) parentId = subset.id.replace('gg', '');
        else if (subset.id.endsWith('sv')) parentId = subset.id.replace('sv', '');
        else if (subset.id.endsWith('shswtg')) parentId = subset.id.replace('shswtg', '');
        else if (subset.id === 'sma') parentId = 'sm115'; // Hidden Fates
        else if (subset.id === 'cel25c') parentId = 'cel25'; // Celebrations
        
        // Si el parentId está vacío, intentar encontrarlo por nombre base
        if (!parentId) {
            const baseName = subset.name.split(' Gallery')[0].split(' Shiny Vault')[0].split(' Classic Collection')[0].split(':')[0].trim();
            const parentOpt = sets.find(s => s.name === baseName && s.id !== subset.id);
            if (parentOpt) parentId = parentOpt.id;
        }

        const parent = sets.find(s => s.id === parentId);

        if (parent) {
            console.log(`📦 Uniendo [${subset.name}] -> [${parent.name}]`);
            
            const subsetFile = path.join(CARDS_DIR, `${subset.id}.json`);
            const parentFile = path.join(CARDS_DIR, `${parent.id}.json`);

            if (fs.existsSync(subsetFile) && fs.existsSync(parentFile)) {
                const subsetCardsData = JSON.parse(fs.readFileSync(subsetFile, 'utf8'));
                const parentCardsData = JSON.parse(fs.readFileSync(parentFile, 'utf8'));

                const subsetCards = subsetCardsData.data || [];
                const parentCards = parentCardsData.data || [];

                // Marcar cartas del subset para que el simulador sepa de dónde vienen
                const markedSubsetCards = subsetCards.map(c => ({
                    ...c,
                    isSubset: true,
                    subsetName: subset.name
                }));

                // Unir cartas
                const combinedCards = [...parentCards, ...markedSubsetCards];
                
                // Actualizar archivo del padre
                parentCardsData.data = combinedCards;
                parentCardsData.totalCards = combinedCards.length;
                parentCardsData.lastUpdated = new Date().toISOString();
                
                fs.writeFileSync(parentFile, JSON.stringify(parentCardsData, null, 2));
                
                // Actualizar metadata del set en sets.json
                parent.total += subset.total;
                
                // Marcar subset para eliminación
                setsToRemove.add(subset.id);
                mergedSetIds.add(subset.id);
                
                console.log(`   ✅ Fusionadas ${subsetCards.length} cartas.`);
            } else {
                console.log(`   ⚠️ Faltan archivos de cartas para ${subset.id} o ${parent.id}`);
            }
        }
    }

    // 2. Limpiar sets.json
    if (setsToRemove.size > 0) {
        setsData.data = sets.filter(s => !setsToRemove.has(s.id));
        setsData.totalSets = setsData.data.length;
        fs.writeFileSync(SETS_FILE, JSON.stringify(setsData, null, 2));
        console.log(`\n♻️  Eliminados ${setsToRemove.size} subsets de sets.json`);
    }

    console.log('\n✨ Proceso de unificación finalizado.');
}

main();

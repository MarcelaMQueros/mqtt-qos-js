const db = require('./database.cjs');

const setores = ['A', 'B', 'C'];
const vagasPorSetor = 30;

const insert = db.prepare(`INSERT OR IGNORE INTO spots 
    (spotId, sectorId, currentState, lastChangeTs) 
    VALUES (?, ?, ?, ?)`);

const agora = new Date().toISOString();

const setup = db.transaction(() => {
    for (const setor of setores) {
        for (let i = 1; i <= vagasPorSetor; i++) {
            const spotId = `${setor}-${i.toString().padStart(2, '0')}`;
            insert.run(spotId, setor, 'FREE', agora);
        }
    }
});

setup();
process.exit();
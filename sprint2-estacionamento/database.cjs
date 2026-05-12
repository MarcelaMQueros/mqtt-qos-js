const Database = require('better-sqlite3');
const db = new Database('./parking.db');

// O better-sqlite3 executa comandos SQL direto com o .exec()
db.exec(`
    CREATE TABLE IF NOT EXISTS spots (
        spotId TEXT PRIMARY KEY,
        sectorId TEXT,
        currentState TEXT DEFAULT 'FREE',
        lastChangeTs DATETIME,
        lastEventId TEXT
    );

    CREATE TABLE IF NOT EXISTS spot_events (
        eventId TEXT PRIMARY KEY,
        ts DATETIME,
        sectorId TEXT,
        spotId TEXT,
        state TEXT,
        rawPayloadJson TEXT
    );

    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tsOpen DATETIME,
        tsClose DATETIME,
        type TEXT,
        severity TEXT,
        sectorId TEXT,
        spotId TEXT,
        evidenceJson TEXT,
        status TEXT DEFAULT 'open'
    );

    CREATE TABLE IF NOT EXISTS recommendations_log (
        ts DATETIME,
        fromSector TEXT,
        recommendedSector TEXT,
        reason TEXT,
        dataJson TEXT
    );
`);

console.log(" Banco de dados BETTER-SQLITE3");

module.exports = db;
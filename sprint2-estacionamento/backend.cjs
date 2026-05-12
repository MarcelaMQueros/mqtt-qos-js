const mqtt = require('mqtt');
const db = require('./database.cjs');

const client = mqtt.connect('mqtt://127.0.0.1:1883');
const ultimoEvento = {}; 

client.on('connect', () => {
    client.subscribe('campus/parking/sectors/+/spots/+/events');
});

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    const { eventId, ts, sectorId, spotId, state } = data;

    try {
        const check = db.prepare("SELECT eventId FROM spot_events WHERE eventId = ?").get(eventId);
        if (check) return;

        db.prepare(`INSERT INTO spot_events (eventId, ts, sectorId, spotId, state, rawPayloadJson) 
                    VALUES (?, ?, ?, ?, ?, ?)`).run(eventId, ts, sectorId, spotId, state, JSON.stringify(data));

        db.prepare(`UPDATE spots SET currentState = ?, lastChangeTs = ?, lastEventId = ? WHERE spotId = ?`)
          .run(state, ts, eventId, spotId);

        const agora = new Date();
        if (ultimoEvento[spotId]) {
            const diff = (agora - new Date(ultimoEvento[spotId].ts)) / 1000;
            if (diff < 5) {
                db.prepare(`INSERT INTO incidents (tsOpen, type, severity, sectorId, spotId, status) 
                            VALUES (?, 'FLAPPING', 'MEDIUM', ?, ?, 'open')`)
                  .run(ts, sectorId, spotId);
            }
        }
        ultimoEvento[spotId] = { ts, state };

        const res = db.prepare("SELECT COUNT(*) as ocupadas FROM spots WHERE sectorId = ? AND currentState = 'OCCUPIED'").get(sectorId);
        const total = 30;
        const taxa = res.ocupadas / total;

        if (taxa >= 0.90) {
            const livre = db.prepare(`
                SELECT sectorId, (30 - COUNT(*)) as disponiveis 
                FROM spots 
                WHERE sectorId != ? AND currentState = 'FREE' 
                GROUP BY sectorId 
                ORDER BY disponiveis DESC LIMIT 1
            `).get(sectorId);

            if (livre) {
                const percentual = (taxa * 100).toFixed(0);
                const reason = `Setor ${sectorId} com ${percentual}% de ocupação; Setor ${livre.sectorId} tem ${livre.disponiveis} vagas livres`;
                
                db.prepare(`INSERT INTO recommendations_log (ts, fromSector, recommendedSector, reason) 
                            VALUES (?, ?, ?, ?)`)
                  .run(new Date().toISOString(), sectorId, livre.sectorId, reason);
                
                client.publish('campus/parking/recommendations', JSON.stringify({
                    fromSector: sectorId,
                    recommendedSector: livre.sectorId,
                    reason: reason,
                    ts: new Date().toISOString()
                }));
            }
        }

    } catch (e) {
        process.stderr.write(e.message + "\n");
    }
});
const express = require('express');
const db = require('./database.cjs');
const app = express();

app.get('/api/v1/map', (req, res) => {
    const spots = db.prepare("SELECT * FROM spots").all();
    res.json({ spots });
});

app.get('/api/v1/sectors', (req, res) => {
    const data = db.prepare(`
        SELECT sectorId, 
        COUNT(*) as total,
        SUM(CASE WHEN currentState = 'OCCUPIED' THEN 1 ELSE 0 END) as occupiedCount,
        SUM(CASE WHEN currentState = 'FREE' THEN 1 ELSE 0 END) as freeCount
        FROM spots GROUP BY sectorId
    `).all();

    const report = data.map(r => ({
        sectorId: r.sectorId,
        occupiedCount: r.occupiedCount,
        freeCount: r.freeCount,
        occupancyRate: (r.occupiedCount / r.total).toFixed(2),
        lastUpdateTs: new Date().toISOString()
    }));
    res.json(report);
});

app.get('/api/v1/sectors/:sectorId/spots', (req, res) => {
    const spots = db.prepare("SELECT * FROM spots WHERE sectorId = ?").all(req.params.sectorId);
    res.json(spots);
});

app.get('/api/v1/sectors/:sectorId/free-spots', (req, res) => {
    const limit = req.query.limit || 10;
    const spots = db.prepare("SELECT * FROM spots WHERE sectorId = ? AND currentState = 'FREE' LIMIT ?")
                    .all(req.params.sectorId, limit);
    res.json(spots);
});

app.get('/api/v1/reports/turnover', (req, res) => {
    const { sectorId, from, to } = req.query;
    const sql = `SELECT COUNT(*) as total FROM spot_events 
                 WHERE sectorId = ? AND state = 'OCCUPIED' 
                 AND ts BETWEEN ? AND ?`;
    const result = db.prepare(sql).get(sectorId, from, to);
    res.json({
        sectorId,
        from,
        to,
        turnover: result.total
    });
});

app.get('/api/v1/incidents', (req, res) => {
    const status = req.query.status || 'open';
    const incidents = db.prepare("SELECT * FROM incidents WHERE status = ?").all(status);
    res.json(incidents);
});

app.get('/api/v1/recommendation', (req, res) => {
    const { fromSector } = req.query;
    const rec = db.prepare(`SELECT fromSector, recommendedSector, reason, ts 
                            FROM recommendations_log 
                            WHERE fromSector = ? 
                            ORDER BY ts DESC LIMIT 1`).get(fromSector);
    
    if (rec) {
        res.json({
            fromSector: rec.fromSector,
            recommendedSector: rec.recommendedSector,
            reason: rec.reason,
            ts: rec.ts
        });
    } else {
        res.json({ message: "Sem recomendações para este setor" });
    }
});

app.listen(3000);
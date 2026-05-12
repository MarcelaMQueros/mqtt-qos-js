const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

const client = mqtt.connect('mqtt://127.0.0.1:1883');

const setores = ['A', 'B', 'C'];
const vagasPorSetor = 30;

const configFalhas = {
    'A-05': 'FLAPPING',
    'B-10': 'STUCK_OCCUPIED'
};

client.on('connect', () => {
    setInterval(() => {
        setores.forEach(setor => {
            const topic = `campus/parking/sectors/${setor}/gateway/status`;
            const payload = { ts: new Date().toISOString(), status: "online" };
            client.publish(topic, JSON.stringify(payload));
        });
    }, 10000);

    setInterval(() => {
        const setor = setores[Math.floor(Math.random() * setores.length)];
        const num = Math.floor(Math.random() * vagasPorSetor) + 1;
        const spotId = `${setor}-${num.toString().padStart(2, '0')}`;
        
        let state = Math.random() > 0.5 ? 'OCCUPIED' : 'FREE';

        if (configFalhas[spotId]) {
            if (configFalhas[spotId] === 'STUCK_OCCUPIED') {
                state = 'OCCUPIED';
            }
        }

        const payload = {
            eventId: uuidv4(),
            ts: new Date().toISOString(),
            sectorId: setor,
            spotId: spotId,
            state: state,
            source: "sensor"
        };

        const topic = `campus/parking/sectors/${setor}/spots/${spotId}/events`;
        client.publish(topic, JSON.stringify(payload), { qos: 1 });
        console.log(`[EVENTO] ${spotId}: ${state}`);
    }, 3000); 
});
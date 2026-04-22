import mqtt from "mqtt";

const topic = process.env.MQTT_TOPIC || "devices/device-001/telemetry";
const deviceId = topic.split("/")[1] || "device-001";
const url = process.env.MQTT_URL || "mqtt://localhost:1883";

let seq = 0;
let timer = null;

const client = mqtt.connect(url);

client.on("connect", () => {
  console.log(`[simulator] connected to ${url}`);

  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    const payload = {
      device_id: deviceId,
      ts: new Date().toISOString(),
      seq: seq++,
      temp_c: Number((20 + Math.random() * 10).toFixed(2)),
      message: "hello"
    };

    client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
      if (err) {
        console.error("[simulator] publish error:", err.message);
        return;
      }
      console.log("[simulator] published", topic, payload);
    });
  }, 1000);
});

client.on("error", (err) => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  console.error("[simulator] mqtt error:", err.message);
});

client.on("close", () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

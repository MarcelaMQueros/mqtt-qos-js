import mqtt from "mqtt";

const topic = process.env.MQTT_TOPIC || "devices/+/telemetry";
const url = process.env.MQTT_URL || "mqtt://localhost:1883";

const client = mqtt.connect(url);

client.on("connect", () => {
  console.log(`[consumer] connected to ${url}`);
  client.subscribe(topic, { qos: 0 }, (err) => {
    if (err) {
      console.error("[consumer] subscribe error:", err.message);
      return;
    }
    console.log(`[consumer] subscribed to ${topic}`);
  });
});

client.on("message", (receivedTopic, payload) => {
  console.log(`[consumer] ${receivedTopic}: ${payload.toString()}`);
});

client.on("error", (err) => {
  console.error("[consumer] mqtt error:", err.message);
});

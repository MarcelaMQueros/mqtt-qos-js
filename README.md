# mqtt-qos-js

## Node-RED + MQTT hello world lab (Codespaces-ready)

This repository includes a starter project for a 2-week IoT security sprint using Node-RED + MQTT in Docker.

### Location

All new lab files are under:

- `labs/sprint3-nodered-hello`

### Services

`docker compose` in that directory starts:

1. `eclipse-mosquitto` broker on port `1883` (plaintext baseline)
2. `nodered/node-red` UI on port `1880`
3. Node.js simulator publishing every second to `devices/device-001/telemetry`
4. Node.js consumer subscriber logging `devices/+/telemetry`

### Run

```bash
cd labs/sprint3-nodered-hello
docker compose up -d --build
```

### Access

- Node-RED editor: `http://localhost:1880`
- Basic hello dashboard UI from the included flow: `http://localhost:1880/hello-ui`

### Verify behavior

- Simulator publishes JSON payload every second with fields:
  - `device_id`
  - `ts` (ISO string)
  - `seq`
  - `temp_c` (random)
  - `message` (`"hello"`)
- Node-RED flow subscribes to `devices/+/telemetry`
  - message visible in Node-RED Debug panel
  - latest payload + temp chart available in `/hello-ui`

### Logs

```bash
cd labs/sprint3-nodered-hello
docker compose logs -f simulator consumer nodered mosquitto
```

### Stop

```bash
cd labs/sprint3-nodered-hello
docker compose down
```

### Codespaces

A new `.devcontainer/devcontainer.json` is included to:

- forward ports `1880` and `1883`
- auto-start the lab stack on startup with:
  - `docker compose -f labs/sprint3-nodered-hello/docker-compose.yml up -d --build`

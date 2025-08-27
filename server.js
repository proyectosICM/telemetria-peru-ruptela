const net = require('net');
const ruptelaParser = require('ruptela');   // renombrado para no sobrescribir process
const mqtt = require('mqtt');

// Configuración del broker MQTT
const mqttOptions = {
    host: "192.168.0.204",
    port: 1883
};
const mqttClient = mqtt.connect(mqttOptions);

mqttClient.on("connect", () => {
    console.log("Conectado al broker MQTT en %s:%s", mqttOptions.host, mqttOptions.port);
});
mqttClient.on("error", (err) => {
    console.error("Error en conexión MQTT:", err.message);
});

const server = net.createServer();

server.on('connection', (conn) => {
    const addr = conn.remoteAddress + ':' + conn.remotePort;
    console.log('New connection from %s', addr);

    let buffer = Buffer.alloc(0);  // Buffer para acumular datos

    conn.on('data', (data) => {
        console.log('Data received from %s:', addr, data);

        buffer = Buffer.concat([buffer, data]);

        while (buffer.length >= 4) {
            const packetLength = buffer.readUInt16BE(0);
            const fullPacketSize = packetLength + 4;

            if (buffer.length >= fullPacketSize) {
                const packet = buffer.slice(0, fullPacketSize);
                buffer = buffer.slice(fullPacketSize);

                // Procesar el paquete completo
                const res = ruptelaParser(packet);
                console.log('Response to connection %s: %j', addr, res);

                if (!res.error) {
                    console.log('Procesado correctamente');
                    conn.write(res.ack);

                    // 👉 Enviar resultado al broker MQTT
                    mqttClient.publish("prueba", JSON.stringify({
                        client: addr,
                        raw: packet.toString("hex"),   // datos crudos en hex
                        parsed: res
                    }), { qos: 1 }, (err) => {
                        if (err) console.error("Error publicando en MQTT:", err.message);
                    });

                } else {
                    console.log('Procesado con errores:', res.error);
                }
            } else {
                break;
            }
        }
    });

    conn.once('close', () => {
        console.log('Connection from %s closed', addr);
    });

    conn.on('error', (error) => {
        console.log('Error from connection %s: %s', addr, error.message);
    });
});

const port = 9527;
server.listen(port, () => {
    console.log('Server started on port %s', port);
});

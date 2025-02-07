const net = require('net');
const process = require('ruptela');

const server = net.createServer();
server.on('connection', (conn) => {
    const addr = conn.remoteAddress + ':' + conn.remotePort;
    console.log('New connection from %s', addr);

    let buffer = Buffer.alloc(0);  // Buffer para acumular datos

    conn.on('data', (data) => {
        console.log('Data received from %s:', addr, data);

        // Acumular los datos en el buffer
        buffer = Buffer.concat([buffer, data]);

        while (buffer.length >= 4) {  // Necesitamos al menos 4 bytes para leer el tamaño del paquete
            const packetLength = buffer.readUInt16BE(0);  // Leer el tamaño del paquete
            const fullPacketSize = packetLength + 4;  // packetLength + 2 bytes del tamaño + 2 bytes del CRC16

            if (buffer.length >= fullPacketSize) {
                const packet = buffer.slice(0, fullPacketSize);  // Extraer el paquete completo
                buffer = buffer.slice(fullPacketSize);  // Eliminar el paquete del buffer

                // Procesar el paquete completo
                const res = process(packet);
                console.log('Response to connection %s: %j', addr, res);

                if (!res.error) {
                    console.log('Procesado correctamente');
                    conn.write(res.ack);  // Enviar la confirmación
                } else {
                    console.log('Procesado con errores:', res.error);
                }
            } else {
                // Si no tenemos suficientes datos para el paquete completo, esperar más datos
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

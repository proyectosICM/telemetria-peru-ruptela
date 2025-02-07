const server = require('net').createServer();
const process = require('ruptela');

server.on('connection', (conn) => {
    const addr = conn.remoteAddress + ':' + conn.remotePort;
    console.log('New connection from %s', addr);

    conn.on('data', (data) => {
        //console.log('New data from connection %s: %j', addr, data);


        // Verificar el tamaño del paquete
        const packetLength = data.readUInt16BE(0);
        console.log('Packet length:', packetLength);

        // El tamaño del paquete más 4 bytes (Packet length + CRC16)
        if (packetLength + 4 <= 12) {  // Por ejemplo, descartar paquetes de tamaño menor o igual a 12 bytes
            console.log('Paquete ack recibido, ignorado.');
            return;
        }

        const res = process(data);

        console.log('Response to connection %s: %j', addr, res);
        if (!res.error) {
            //do something with res.dataº
            console.log('Procesado correctamente');
            //return acknowledgement
            conn.write(res.ack);
        } else {
            console.log('Procesado con errores');
            console.log(res.error);
            //do something with res.error
        }
    });
    conn.once('close', () => {
        console.log('Connection from %s closed', addr);
    })
    conn.on('error', (error) => {
        console.log('Error from connection %s: %s', addr, error.message);
    });
});
port = 9527;
//configure server to listen on PORT
server.listen(port, () => {
    console.log('Server started on port %s at %s', server.address().port, server.address().address);
});
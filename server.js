const server = require('net').createServer();
const process = require('ruptela');

server.on('connection', (conn) => {
    const addr = conn.remoteAddress + ':' + conn.remotePort;
    console.log('New connection from %s', addr);

    const confirmationMessage = Buffer.from([0x01]);  // Mensaje de confirmación en formato binario
    conn.write(confirmationMessage);

    conn.on('data', (data) => {
        //console.log('New data from connection %s: %j', addr, data);
        console.log(`Received packet size: ${packetSizeBytes} bytes (${packetSizeBits} bits)`);

º
        // Recortar los dos primeros bytes
        if (data.length < 2) {
            console.log('Received data is too short to process.');
            return;
        }

        const lengthBytes = data.slice(0, 2); // Los dos primeros bytes que representan la longitud
        const actualData = data.slice(2);    // El resto del paquete después de los primeros dos bytes


        const res = process(data);
        if (!res.error) {
            //do something with res.data
            console.log('Processed data:', res.data);
            //return acknowledgement
            //conn.write(res.ack);
        } else {
            // Si no hubo error, hacer algo con los datos
            console.log('Processed data:', res.data);
            //console.log('Processed data:', res);
            //console.log(res);
            // Regresar el reconocimiento
            //conn.write(res.ack);
        }
    });
    conn.once('close', () => {
        console.log('Connection from %s closed', addr);
    });
    conn.on('error', (error) => {
        console.log('Error from connection %s: %s', addr, error.message);
    });
});
//configure server to listen on PORT
const port = 9527;

server.listen(port, () => {
    console.log('Server started on port %s at %s', server.address().port, server.address().address);
});

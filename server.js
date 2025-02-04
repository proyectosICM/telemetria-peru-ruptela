const server = require('net').createServer();
const process = require('ruptela');

server.on('connection', (conn) => {
    const addr = conn.remoteAddress + ':' + conn.remotePort;
    console.log('New connection from %s', addr);

    conn.on('data', (data) => {
        console.log('New data from connection %s: %j', addr, data);

        // Calcula la longitud del paquete en bytes y bits
        const packetSizeBytes = data.length;
        const packetSizeBits = packetSizeBytes * 8;

        console.log(`Received packet size: ${packetSizeBytes} bytes (${packetSizeBits} bits)`);


        const res = process(data);
        if (!res.error) {
            //do something with res.data
        
            //return acknowledgement
            conn.write(res.ack);
        } else {
            // Si no hubo error, hacer algo con los datos
            console.log('Processed data:', res.data);
            //console.log('Processed data:', res);
            //console.log(res);
            // Regresar el reconocimiento
            conn.write(res.ack);
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

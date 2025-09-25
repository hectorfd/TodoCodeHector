import ApiServer from './src/services/api.js';

console.log('Iniciando servidor API...');

const server = new ApiServer(3001);
server.start();

console.log('✅ API server corriendo en http://localhost:3001');
console.log('✅ Base de datos SQLite inicializada');

process.on('SIGINT', () => {
  console.log('\nCerrando servidor...');
  server.stop();
  process.exit(0);
});
const config = {
PORT: 3000,
MYSQL_PORT: 3306,
SALT_ROUNDS: 10,
JWT_SECRET: 'your_jwt_secret_key'};

const routes = {
  HOME: '/',
  API: '/api'};

  const admin = {
  email: 'admin@gmail.com',
  nickname: 'admin',
  password: 'admin123',
  role: 'admin'
  };

const bbdd = {
  HOST: 'localhost',
  USER : 'TFG',
  PASSWORD : 'cereza2610',
  DATABASE : 'tfg',
  PORT: config.MYSQL_PORT
}
  module.exports={config,routes,bbdd, admin};
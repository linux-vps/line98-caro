import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    sync: process.env.DB_SYNC === 'true' ? true : false,
    autoLoad: process.env.DB_AUTOLOAD === 'true' ? true : false,
}));
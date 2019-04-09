import {TypeOrmOptions} from 'typeorm';

export default class DatabaseConfig implements TypeOrmOptions {
    public type: 'mysql' | 'monogodb' = 'mysql';
    public host: string = process.env.TYPEORM_HOST;
    public username: string = process.env.TYPEORM_USERNAME;
    public password: string = process.env.TYPEORM_PASSWORD;
    public database: string = process.env.TYPEORM_DATABASE;
    public logging: boolean = process.env.TYPEORM_LOGGING === 'true';
    public sync: boolean = process.env.TYPEORM_SYNCHRONIZE === 'true';
    public entities: string[] = process.env.TYPEORM_ENTITIES.split(',');
    public port: number = parseInt(process.env.TYPEORM_PORT);
};

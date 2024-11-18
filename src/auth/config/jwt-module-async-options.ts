import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtModuleOptions = (config: ConfigService): JwtModuleOptions => {
  return {
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: config.get('JWT_EXP', '10m') },
  };
};

export const options = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => jwtModuleOptions(config),
});

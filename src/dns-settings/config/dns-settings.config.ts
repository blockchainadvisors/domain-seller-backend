import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { DnsSettingsConfig } from './dns-settings.type';

class EnvironmentVariablesValidator {
  @IsString()
  GODADDY_SECRET: string;

  @IsString()
  GODADDY_KEY: string;

  @IsString()
  GODADDY_BASE_URL: string;

  @IsString()
  GODADDY_CUSTOMER_ID: string;
}

export default registerAs<DnsSettingsConfig>('dnssettings', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    godaddySecret: process.env.GODADDY_SECRET,
    godaddyKey: process.env.GODADDY_KEY,
    godaddyBaseUrl: process.env.GODADDY_BASE_URL,
    godaddyCustomerId: process.env.GODADDY_CUSTOMER_ID,
  };
});

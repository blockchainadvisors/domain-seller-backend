import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { PaymentConfig } from './payment-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  STRIPE_SECRET_KEY: string;
}

export default registerAs<PaymentConfig>('payment', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    stripeSecretKey:
      process.env.STRIPE_SECRET_KEY || 'ggfffffffffffffffffffffffffffffffffff',
  };
});

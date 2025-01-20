import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DomainsService } from '../domains/domains.service';
import { console } from 'inspector';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class DnsSettingsSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(DnsSettingsSchedulerService.name);

  private readonly interval = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
  private readonly godaddyBaseUrl: string;
  private readonly godaddyKey: string;
  private readonly godaddySecret: string;

  constructor(
    private readonly domainService: DomainsService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.godaddyKey = this.configService.getOrThrow('dnssettings.godaddyKey', {
      infer: true,
    });

    this.godaddyBaseUrl = this.configService.getOrThrow(
      'dnssettings.godaddyBaseUrl',
      { infer: true },
    );

    this.godaddySecret = this.configService.getOrThrow(
      'dnssettings.godaddySecret',
      { infer: true },
    );
  }

  onModuleInit() {
    void this.initFetchDomiansFromGodaddy();
  }

  private async initFetchDomiansFromGodaddy() {
    await this.fetchDomiansFromGodaddy();

    // Schedule the task to run every 6 hours
    setInterval(async () => {
      this.logger.warn(
        'Running scheduled job for `fetch all domains from godaady`...',
      );
      await this.fetchDomiansFromGodaddy();
    }, this.interval);
  }

  // Method to check and update auction statuses
  private async fetchDomiansFromGodaddy() {
    try {
      // Prepare API URL and headers
      const headers = {
        Authorization: `sso-key ${this.godaddyKey}:${this.godaddySecret}`,
        'Content-Type': 'application/json',
      };
      const apiUrl = `${this.godaddyBaseUrl}/v1/domains`;

      // Make the request
      const response = await axios.get(apiUrl, { headers });

      const formattedData = response.data.map((item) => ({
        url: item.domain, // Extract the domain field from GoDaddy API response
        status: 'LISTED', // Set the default status
      }));

      const saveDomain = await this.domainService.createMany(formattedData);

      //return formattedData;
    } catch (error) {
      // Handle and log errors
      if (axios.isAxiosError(error)) {
        console.error('Error response for domain details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new BadRequestException({
          errors: {
            message: `Error fetching Domain details: ${error.response?.data?.message || 'Unknown error'}`,
          },
        });
      } else {
        console.error('Unexpected error:', error.message);
        throw new Error(`Failed to fetch all domain.`);
      }
    }
  }
}

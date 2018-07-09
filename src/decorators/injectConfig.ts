import { Inject } from '@nestjs/common';
import { ConfigService } from '../module/config.service';

const InjectConfig = () => Inject(ConfigService);

export default InjectConfig;

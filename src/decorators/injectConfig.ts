import { Inject } from "@nestjs/common";
import ConfigService from "../ConfigModule/config.service";

const InjectConfig = () => Inject(ConfigService);

export default InjectConfig;

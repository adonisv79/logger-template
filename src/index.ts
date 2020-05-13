export interface KeyValuePair<T> {
  [index: string]: T;
}

export interface LoggerConfig {
  onCritical: (message: string, data?: KeyValuePair<any> | Error) => Promise<void>;
  onError: (message: string, data?: KeyValuePair<any> | Error) => Promise<void>;
  onWarn: (message: string, data?: KeyValuePair<any>) => Promise<void>;
  onInfo: (message: string, data?: KeyValuePair<any>) => Promise<void>;
  onDebug: (message: string, data?: KeyValuePair<any>) => Promise<void>;
}

export class LoggerTemplate {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  async crit(message: string, data?: KeyValuePair<any> | Error): Promise<void> {
    await this.config.onCritical(message, data);
  }

  async error(message: string, data?: KeyValuePair<any> | Error): Promise<void> {
    await this.config.onError(message, data);
  }

  async warn(message: string, data?: KeyValuePair<any>): Promise<void> {
    await this.config.onWarn(message, data);
  }

  async info(message: string, data?: KeyValuePair<any>): Promise<void> {
    await this.config.onInfo(message, data);
  }

  async debug(message: string, data?: KeyValuePair<any>): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      await this.config.onDebug(message, data);
    }
  }
}

import app from './app';
import { ENV_VARS, logger } from './utils';

app.listen(ENV_VARS.PORT, () => {
  logger.info(`Server running on port ::${ENV_VARS.PORT} in ${process.env.NODE_ENV} mode`);
});

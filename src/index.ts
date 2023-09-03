import app from './app';
import { ENV_VARS } from './utils';

app.listen(ENV_VARS.PORT, () => {
    console.log(`Server running on port ::${ENV_VARS.PORT} in ${process.env.NODE_ENV} mode`);
});

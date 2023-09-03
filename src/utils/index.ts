import dotenv from 'dotenv';

type EnvVars = {
    [key: string]: string;
};

export const ENV_VARS = dotenv.config().parsed as EnvVars;

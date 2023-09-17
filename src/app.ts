import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Application = express();

const corsOptions = {
  origin: ['*'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', routes);

export default app;

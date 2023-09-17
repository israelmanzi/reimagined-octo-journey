import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Application = express();

const corsOptions = {
  origin: ['*'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', routes).get('/', (req: Request, res: Response) =>
  res.json({
    message: 'MyVital API!',
  }),
);

export default app;

import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

const corsOptions = {
  origin: ['*'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

export default app;

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { extractPreviewFromVideo } from './src/videoExtraction';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  extractPreviewFromVideo();
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
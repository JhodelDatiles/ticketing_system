import express, {type Request, type Response} from 'express';
import {config} from './envConfig.ts'

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

app.listen(config.port, ()=>{
  console.log('Server is running')
})

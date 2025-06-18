import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { AssessmentController } from './controllers/assessmentController';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

const assessmentController = new AssessmentController();

// Routes
app.post('/api/assess', assessmentController.assess);
app.get('/api/neighborhoods', assessmentController.getNeighborhoods);
app.get('/api/neighborhoods/:neighborhoodId', assessmentController.getNeighborhoodDetails);
app.get('/api/foundation-types', assessmentController.getFoundationTypes);
app.get('/api/materials', assessmentController.getMaterials);
app.get('/api/mitigation-options', assessmentController.getMitigationOptions);


app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🌊 Miles' Tech Assessment running on port ${port}`);
  console.log(`📊 API endpoint, for postman testing: http://localhost:${port}/api/assess`);
  console.log(`🏠 Frontend: http://localhost:${port}`);
  console.log(process.env.OPENAI_API_KEY ? 'Using real LLM content' : 'No openAI API key found, using mocks')
});

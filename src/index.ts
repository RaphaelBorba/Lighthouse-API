import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});


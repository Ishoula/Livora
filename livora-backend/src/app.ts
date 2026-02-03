import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import favoriteRoutes from './routes/favorite.routes';
import propertyRoutes from './routes/property.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import { notFound } from './middlewares/nonFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
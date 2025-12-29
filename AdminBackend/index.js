import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import servicesRouter from './server/routes/services.route.js';
import coursesRouter from './server/routes/courses.route.js';
import channelsRouter from './server/routes/channels.route.js';
import playlistsRouter from './Server/routes/playlists.route.js';
import quizzesRouter from './Server/routes/quizzes.route.js';
import videosRouter from './server/routes/videos.route.js'; // ✅ Import videos route
import categoryRoutes from "./Server/routes/categories.route.js";
import dashboardRouter from "./Server/routes/dashboard.route.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/videos', videosRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRouter);


// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
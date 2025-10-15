import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV) {
  app.set('trust proxy', 1);
}

//  test server
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'CareFlow-EHR API is running!',
    timestamp: new Date().toISOString(),
    status: 'Server is working'
  });
});

// API routes
app.use('/api', routes);

//error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV ? err.message : undefined,
  });
});

export default app;

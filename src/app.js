import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index.js";
import config from "./config/index.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// CORS for single or multiple client URLs
const corsOrigins = (config.clientUrls && config.clientUrls.length > 0)
  ? config.clientUrls
  : (config.clientUrl ? [config.clientUrl] : []);
if (corsOrigins.length > 0) {
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser tools
      if (corsOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }));
}
// trust proxy for secure cookies
app.set('trust proxy', 1);

//  health and info
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.get('/readyz', (req, res) => {
  res.status(200).json({ ready: true });
});

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

// error handling middleware
app.use(errorHandler);

export default app;

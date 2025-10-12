const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  test server
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CareFlow-EHR API is running!',
    timestamp: new Date().toISOString(),
    status: 'Server is working'
  });
});

//error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV ? err.message : undefined,
  });
});

module.exports = app;

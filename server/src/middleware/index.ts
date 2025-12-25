import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Base middleware configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS;
const corsOptions = allowedOrigins === '*'
  ? { origin: true, credentials: true }
  : { origin: allowedOrigins?.split(','), credentials: true };

const baseMiddleware = [
  // Security middleware
  helmet(),

  // Enable CORS for all routes
  cors(corsOptions),

  // Enable compression
  compression(),

  // Parse JSON bodies
  express.json({ limit: '10mb' }),

  // Parse URL-encoded bodies
  express.urlencoded({ extended: true, limit: '10mb' }),
];

export default baseMiddleware;
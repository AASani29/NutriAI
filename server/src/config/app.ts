// Application configuration
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_for_development',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};

export default config;
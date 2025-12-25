import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global instance to prevent hot-reload issues
  const globalWithPrisma = global as typeof global & {
    prisma: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  
  prisma = globalWithPrisma.prisma;
}

export default prisma;

// Export the PrismaClient type for use in other files
export { PrismaClient };
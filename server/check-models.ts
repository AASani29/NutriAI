
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('Models:', Object.keys(prisma).filter(k => k[0] !== '_'));
process.exit(0);


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const fields = (prisma as any).consumptionLog.fields || {};
    console.log('Fields:', Object.keys(fields));
}
main().catch(console.error).finally(() => process.exit(0));

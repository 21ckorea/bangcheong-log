
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const programs = await prisma.program.findMany();
    console.log(`Found ${programs.length} programs.`);
    programs.forEach(p => {
        console.log(`[${p.broadcaster}] ${p.title}`);
        try {
            const data = JSON.parse(p.castData);
            console.log(`   Image: ${data.image || 'NONE'}`);
            console.log(`   Link: ${data.link}`);
        } catch (e) {
            console.log(`   Error parsing castData: ${p.castData}`);
        }
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

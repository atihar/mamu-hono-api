import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";


const dream = new Hono()
const prisma = new PrismaClient();


dream.post('/', async (c) => {
    const { title, description, date_of_dream } = await c.req.json();

    const dream = await prisma.dream.create({
        data: {
            title,
            description,
            date_of_dream,
            user: {
                connect: {
                    email: "papajohn@gmail.com",
                }
            },
            created_at: new Date(),
            updated_at: new Date()
        },
    });

    prisma.$disconnect();
    return c.json({ data: dream, status: 200 })
})

dream.get('/', async (c) => {
    return c.json({ data: "dream by user", status: 200 })
})


export default dream
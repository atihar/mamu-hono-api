import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";


const interpretation = new Hono()
const prisma = new PrismaClient();


interpretation.post('/', async (c) => {
    const { description, dream_id } = await c.req.json();

    const message = await prisma.interpretation.create({
        data: {
            description,
            dream: {
                connect: {
                    id: "c85b0f58-5df2-4b68-9167-39434d737ac0",
                }
            },
            created_at: new Date(),
            updated_at: new Date()
        },
    });

    prisma.$disconnect();
    return c.json({ data: message, status: 200 })
})

interpretation.get('/', async (c) => {
    return c.json({ data: "Interpretation by dream", status: 200 })
})


export default interpretation
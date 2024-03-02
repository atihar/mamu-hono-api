import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";
import { decode } from 'hono/jwt'


const dream = new Hono()
const prisma = new PrismaClient();


dream.post('/', async (c) => {
    const { title, description, date_of_dream, email } = await c.req.json();

    const dream = await prisma.dream.create({
        data: {
            title,
            description,
            date_of_dream,
            user: {
                connect: {
                    email: email,
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
    const email = c.req.queries('u')

    const dreams = await prisma.dream.findMany({
        where: {
            userEmail: email?.toString()
        }
    }
    )
    return c.json(dreams)
})


export default dream
import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";

const register = new Hono()
const prisma = new PrismaClient();


register.get('/', (c) => {
  return c.text('Registration get Hono!')
})

register.post('/', async (c) => {
    const { username, email, password, phone } = await c.req.json();
    // create a new user
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password,
            isVerified: false,
            phone,
            created_at: new Date(),
            updated_at: new Date()
        },
    });

    return c.json({ data: user, status: 200 })
})

export default register
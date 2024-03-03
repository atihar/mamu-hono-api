import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";


const register = new Hono()
const prisma = new PrismaClient();


register.get('/', (c) => {
    return c.text('Registration get Hono!')
})

register.post('/', async (c) => {
    const { username, email, password, phone, birth_date, gender, location, belief } = await c.req.json();

    const hashPassword = await bcrypt.hash(password, 10);
    // create a new user
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashPassword,
            isVerified: false,
            phone,
            birth_date,
            gender,
            location,
            belief,
            created_at: new Date(),
            updated_at: new Date()
        },
    });

    return c.json({ data: user, status: 200 })
})

export default register
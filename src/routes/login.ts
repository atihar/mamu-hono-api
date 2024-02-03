import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";
import { env } from 'hono/adapter'
import { decode, sign, verify } from 'hono/jwt'

const login = new Hono()
const prisma = new PrismaClient();



login.post('/', async (c) => {
    const { SECRET } = env<{ SECRET: string }>(c)
    const { email, password } = await c.req.json();

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) {
        // User with the provided email doesn't exist
        return c.json({ data: "no match found of the given credentials", status: 500 })
    }

    if (user.password) {
        // const match = await bcrypt.compare(
        //     password,
        //     user?.hashPassword
        // );
        if (user.password === password) {
            const payload = {
                email: email,
                role: 'dreamer',
            }
            const token = await sign(payload, SECRET)
            return c.json({ token, status: 500 })
        }
        // Password doesn't match
        prisma.$disconnect();
        return c.json({ data: "Something went wrong", status: 200 })
    }
})

// login.post('/', async (c) => {
//     const { tokenToDecode } = await c.req.json();
//     console.log(tokenToDecode);
//     const { header, payload } = decode(tokenToDecode);
//     return c.json({ data: payload, status: 200 })
// })


export default login
import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";
import { decode } from 'hono/jwt'
import OpenAI from 'openai';


const dream = new Hono()
const prisma = new PrismaClient();
const openai = new OpenAI({
    timeout: 30 * 1000, // 30 seconds (default is 10 minutes)
});


dream.post('/', async (c) => {
    const { title, description, date_of_dream, email } = await c.req.json();
    console.log(description)

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

    // Construct a clearer and more formatted prompt
    const prompt = `
        Dream Description: ${description} 
        Dream ID: ${dream.id} 

        Interpret the dream considering various perspectives such as philosophy, psychology, astrology, neuroscience, and spiritual information.

        Please reply with a summary in a JSON object format. Include values for summary, a positive affirmation message titled affirmation, and dream type.
        `;


    //sending dream data to openAI for analysis
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
    });

    const interpretedDream = chatCompletion.choices[0].message.content;

    // Extract and parse the JSON data from the interpreted dream
    const interpretedDreamJSON = JSON.parse(interpretedDream!);

    // Access specific fields from the interpreted dream JSON object
    const summary = interpretedDreamJSON.summary;
    const positiveAffirmation = interpretedDreamJSON.affirmation;
    const dreamType = interpretedDreamJSON.dream_type;

    // Use the extracted data as needed
    console.log("Summary:", summary);
    console.log("Positive Affirmation:", positiveAffirmation);
    console.log("Dream Type:", dreamType);

    const message = await prisma.dream.update({
        where: { id: dream.id },
        data: {
            interpretation: summary,
            affirmation: positiveAffirmation,
            dream_type: dreamType,
            updated_at: new Date()
        },
    });

    prisma.$disconnect();
    return c.json({ data: message, status: 200 })
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
dream.delete('/', async (c) => {
    const id = c.req.queries('id')

    try {
        await prisma.dream.delete({
            where: {
                id: id?.toString(),
            }
        }
        )
        return c.json({ data: 'successfully deleted the dream' })
    } catch(err) {
        return c.json({ error: err })
    }
})


export default dream
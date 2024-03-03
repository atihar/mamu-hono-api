import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";
import OpenAI from 'openai';


const interpretation = new Hono();
const prisma = new PrismaClient();
const openai = new OpenAI({
    timeout: 30 * 1000, // 30 seconds (default is 10 minutes)
});


interpretation.post('/', async (c) => {
    const { description, dream_id } = await c.req.json();

    // Construct a clearer and more formatted prompt
    const prompt = `
        Dream Description: ${description} 
        Dream ID: ${dream_id} 

        Interpret the dream considering various perspectives such as philosophy, psychology, astrology, neuroscience, and spiritual information.

        Please reply with a summary in a JSON object format. Include values for summary, a positive affirmation message, and dream type.
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
    const positiveAffirmation = interpretedDreamJSON.positive_affirmation;
    const dreamType = interpretedDreamJSON.dream_type;

    // Use the extracted data as needed
    // console.log("Summary:", summary);
    // console.log("Positive Affirmation:", positiveAffirmation);
    // console.log("Dream Type:", dreamType);

    const message = await prisma.dream.update({
        where: { id: dream_id },
        data: {
            interpretation: summary,
            affirmation: positiveAffirmation,
            dream_type: dreamType,
            updated_at: new Date()
        },
    });

    prisma.$disconnect();
    return c.json({ data: interpretedDream, status: 200 })
})

interpretation.get('/', async (c) => {
    return c.json({ data: "Interpretation by dream", status: 200 })
})


export default interpretation
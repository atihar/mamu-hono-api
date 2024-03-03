import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client";
import OpenAI from 'openai';


const suggestion = new Hono();
const prisma = new PrismaClient();
const openai = new OpenAI({
    timeout: 30 * 1000, // 30 seconds (default is 10 minutes)
});


suggestion.get('/', async (c) => {
    const email = c.req.queries('email')

    const userData = await prisma.user.findUnique({
        where: {
            email: email?.toString(), // Assuming you're looking for the user with ID 1
        },
        include: {
            Dream: true, // Include the dreams associated with the user
        },
    });
    if (userData) {
        const dreams = userData.Dream
        console.log(userData.birth_date)

        // Construct a clearer and more formatted prompt
        const prompt = `
            Dreams: ${dreams} 
            User Date of Birth : ${userData.birth_date}  
    
            Give a daily suggestion considering all Previous Dream from Dreams Data considering various perspectives such as user belief, philosophy, psychology, astrology, neuroscience, and spiritual information.
    
            Keep it short under 30 words and use creativity.
            `;


        //sending dream data to openAI for analysis
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        const suggestion = chatCompletion.choices[0].message.content;

        // Use the extracted data as needed
        // console.log("Summary:", summary);
        // console.log("Positive Affirmation:", positiveAffirmation);
        // console.log("Dream Type:", dreamType);

        return c.json({ data: suggestion, status: 200 })
    }
})

export default suggestion
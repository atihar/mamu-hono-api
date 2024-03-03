import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import login from './routes/login'
import register from './routes/register'
import dream from './routes/dream'
import interpretation from './routes/interpretation'
import suggestion from './routes/suggestion'


const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.route('/login', login);
app.route('/register', register);
app.route('/dream', dream);
app.route('/interpretation', interpretation);
app.route('/suggestion', suggestion);


app.notFound((c) => {
  return c.text('The page you are looking is in another universe', 404)
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Internal computing error', 500)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

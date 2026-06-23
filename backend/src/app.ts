import express from 'express'
import dotenv from 'dotenv'
import { db } from './database/index.ts'
import { handleQuery } from './controllers/queryController.ts'

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 8080

db.connect().then((client) => {
    console.log('Database connection established')
    client.release()
}).catch((error) => {
    console.error('Error connecting to the database:', error)
})

app.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()')
        res.json({ status: 'ok', database: 'connected', time: result.rows[0].now })
    } catch (error) {
        console.error('Error connecting to the database:', error)
        res.status(500).json({ status: 'error', database: 'disconnected' })
    }
})

app.post('/query', handleQuery)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
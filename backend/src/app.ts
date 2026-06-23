import express from 'express'
import dotenv from 'dotenv'
import { db } from './database/index'
import { executor } from './services/database/executor'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

db.connect().then(() => {
    console.log('Database connection established')
}).catch((error) => {
    console.error('Error connecting to the database:', error)
})

app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()')
        res.json({ message: 'Database connected!', time: result.rows[0].now })
    } catch (error) {
        console.error('Error connecting to the database:', error)
        res.status(500).json({ message: 'Database connection error' })
    }
})

app.get('/health', async (req, res) => {
    try {
        await executor('SELECT 1');
        res.json({ status: 'ok', database: 'connected' })
    } catch (error) {
        console.error('Health check failed:', error)
        res.status(500).json({ status: 'error', database: 'disconnected' })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})  
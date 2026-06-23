import express from 'express'
import dotenv from 'dotenv'
import { db } from './database/index'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
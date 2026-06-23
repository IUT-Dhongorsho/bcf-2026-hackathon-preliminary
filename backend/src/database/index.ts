import { Pool } from 'pg'

export const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    onConnect: async (client) => {
        console.log('Connected to the database')
    },
})


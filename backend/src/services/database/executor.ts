import { db } from '../../database/index'

export const executor = async (query: string) => {
    try {
        const result = await db.query(query);
        console.log('Query executed successfully:', result);
    } catch (error) {
        console.error('Error executing query:', error);
    }
}
import crypto from 'node:crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/hello', async () => {
    const transactions = await knex('transactions')
      .insert({
        id: crypto.randomUUID(),
        title: 'Transações de teste',
        amount: 10,
      })
      .returning('*')
    return transactions
  })
}

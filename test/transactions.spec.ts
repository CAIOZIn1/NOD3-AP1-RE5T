import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import resquest from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await resquest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 100,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await resquest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 100,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await resquest(app.server)
      .get('/transactions')
      .set('Cookie', cookies || [])
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 100,
      }),
    ])
  })

  it('should be able to list a specific transactions', async () => {
    const createTransactionResponse = await resquest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 100,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await resquest(app.server)
      .get('/transactions')
      .set('Cookie', cookies || [])
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await resquest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies || [])
      .expect(200)

    expect(getTransactionResponse.body.transactions).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 100,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await resquest(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 500,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await resquest(app.server).post('/transactions').send({
      title: 'Debit transaction',
      amount: 100,
      type: 'debit',
    })

    const summaryResponse = await resquest(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies || [])
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 500,
    })
  })
})

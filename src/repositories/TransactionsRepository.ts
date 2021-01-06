import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce(
      (acumulador: number, valorAtual: Transaction) => {
        if (valorAtual.type === 'income') {
          return acumulador + valorAtual.value;
        }
        return acumulador;
      },
      0,
    );

    const outcome = transactions.reduce(
      (acumulador: number, valorAtual: Transaction) => {
        if (valorAtual.type === 'outcome') {
          return acumulador + valorAtual.value;
        }
        return acumulador;
      },
      0,
    );

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;

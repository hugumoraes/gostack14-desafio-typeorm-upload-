import { getCustomRepository, getRepository } from 'typeorm';
import AppError2 from '../errors/AppError2';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<any> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryExists);
    }

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError2('You do not have enough balance');
    }

    const transaction = transactionRepository.create({
      category_id: categoryExists.id,
      title,
      type,
      value,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

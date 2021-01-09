import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import {
  getRepository,
  getCustomRepository,
  TransactionRepository,
} from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

async function loadCSV(filePath: string): Promise<any[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: any[] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService {
  async execute(file: any): Promise<Transaction[]> {
    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      file.filename,
    );

    const data = await loadCSV(csvFilePath);

    const categories: any[] = [];

    for (let i = 0; i < data.length; i += 1) {
      categories.push(data[i][3]);
    }

    const uniqueCategories = categories.filter((v, i, self) => {
      return i === self.indexOf(v);
    });

    const categoryRepository = getRepository(Category);

    uniqueCategories.map(async category => {
      let categoryExists = await categoryRepository.findOne({
        where: { title: category },
      });

      if (!categoryExists) {
        categoryExists = categoryRepository.create({
          title: category,
        });

        await categoryRepository.save(categoryExists);
      }
    });

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const createdTransactions = transactionRepository.create(
      data.map(d => ({
        title: d[0],
        type: d[1],
        value: d[2],
        category: d[3],
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;

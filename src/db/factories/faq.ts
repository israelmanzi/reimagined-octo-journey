import { v4 } from 'uuid';
import { HttpsError } from '../../utils';
import { TFAQ } from '../types';

export class StringLiteral {
  private readonly value: string;

  constructor(_value: string, type: 'question' | 'answer' | 'category') {
    if (!_value) throw new HttpsError('invalid-argument', `${type} cannot be empty!`);
    if (type === 'question' || (type === 'answer' && _value.length > 1000) || _value.length < 10)
      throw new HttpsError('invalid-argument', 'Question cannot be less than 10 or longer than 1000 characters!');
    if (type === 'category' && _value.length > 50)
      throw new HttpsError('invalid-argument', 'Category cannot be longer than 50 characters!');

    this.value = _value;
  }

  getValue(): string {
    return this.value;
  }
}

export default class FAQFactory {
  private readonly id: string;
  private readonly question: string;
  private readonly answer: string;
  private readonly category: string;

  constructor(question: string, answer: string, category: string) {
    this.id = v4();

    this.question = new StringLiteral(question, 'question').getValue();
    this.answer = new StringLiteral(answer, 'answer').getValue();
    this.category = new StringLiteral(category, 'category').getValue();
  }

  getFAQ(): TFAQ {
    return {
      id: this.id,
      question: this.question,
      answer: this.answer,
      category: this.category,
    };
  }
}

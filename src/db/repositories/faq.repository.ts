import { MongoClient } from 'mongodb';
import { TFAQ } from '../types';
import { ENV_VARS, HttpsError } from '../../utils';

export interface IFAQRepository {
  getFAQs(): Promise<TFAQ[]>;
  getFAQ(id: string): Promise<TFAQ>;
  createFAQ(faq: TFAQ): Promise<TFAQ>;
  updateFAQ(faq: TFAQ): Promise<TFAQ>;
  getFAQsByCategory(category: string): Promise<TFAQ[]>;
}

export default class FAQRepository implements IFAQRepository {
  private readonly db: string;
  private readonly client: MongoClient;
  private static instance: FAQRepository;

  constructor() {
    this.db = ENV_VARS.DB_URI;
    this.client = new MongoClient(this.db);
  }

  static getInstance() {
    if (FAQRepository.instance) {
      return this.instance;
    }
    this.instance = new FAQRepository();
    return this.instance;
  }

  async dbConnect() {
    try {
      await this.client.connect();

      const db = this.client.db('myVital');
      const faqs = db.collection('faqs');

      return { faqs };
    } catch (error: any) {
      await this.client.close();
      throw new HttpsError('failed-precondition', error.message);
    }
  }

  async dbDisconnect() {
    try {
      await this.client.close();
    } catch (error: any) {
      throw new HttpsError('failed-precondition', error.message);
    }
  }

  async getFAQs(): Promise<TFAQ[]> {
    const { faqs } = await this.dbConnect();

    const res = await faqs.find<TFAQ>({}).toArray();

    if (!res.length) throw new HttpsError('not-found', 'No FAQs found!');

    return res;
  }

  async getFAQ(id: string): Promise<TFAQ> {
    const { faqs } = await this.dbConnect();

    const faq = await faqs.findOne<TFAQ>({ id });

    if (!faq) throw new HttpsError('not-found', 'FAQ does not exist!');

    return faq;
  }

  async createFAQ(faq: TFAQ): Promise<TFAQ> {
    const { faqs } = await this.dbConnect();

    await faqs.insertOne(faq);
    await this.dbDisconnect();

    return faq;
  }

  async updateFAQ(faq: TFAQ): Promise<TFAQ> {
    const { faqs } = await this.dbConnect();

    const faqExists = await faqs.findOne<TFAQ>({ id: faq.id });

    if (!faqExists) throw new HttpsError('not-found', 'FAQ does not exist!');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = faq;

    await faqs.updateOne({ id: faq.id }, { $set: { ...rest } });
    await this.dbDisconnect();

    return faq;
  }

  async getFAQsByCategory(category: string): Promise<TFAQ[]> {
    const { faqs } = await this.dbConnect();

    const res = await faqs.find<TFAQ>({ category }).toArray();

    if (!res.length) throw new HttpsError('not-found', 'No FAQs found!');

    return res;
  }

  async deleteFAQ(id: string): Promise<void> {
    const { faqs } = await this.dbConnect();

    const faq = await faqs.findOne<TFAQ>({ id });

    if (!faq) throw new HttpsError('not-found', 'FAQ does not exist!');

    await faqs.deleteOne({ id });
    await this.dbDisconnect();
  }
}

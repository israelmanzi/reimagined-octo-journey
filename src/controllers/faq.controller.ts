import { Request, Response } from 'express';
import FAQRepository from '../db/repositories/faq.repository';
import { ResponseT as R } from '../utils';
import { TFAQ } from '../db/types';

const faqService = FAQRepository.getInstance();

export const FAQController = {
  getAllFAQs: async (req: Request, res: Response) => {
    const faqs = await faqService.getFAQs();

    new R('ok', faqs).sendResponse(req, res);
  },

  getFAQById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const faq = await faqService.getFAQ(id);

    new R('ok', faq).sendResponse(req, res);
  },

  createFAQ: async (req: Request, res: Response) => {
    const body = req.body as TFAQ;

    const faq = await faqService.createFAQ(body);

    new R('ok', faq).sendResponse(req, res);
  },

  updateFAQ: async (req: Request, res: Response) => {
    const body = req.body as TFAQ;

    const faq = await faqService.updateFAQ(body);

    new R('ok', faq).sendResponse(req, res);
  },

  deleteFAQ: async (req: Request, res: Response) => {
    const { id } = req.params;

    await faqService.deleteFAQ(id);

    new R('ok', null).sendResponse(req, res);
  },
};

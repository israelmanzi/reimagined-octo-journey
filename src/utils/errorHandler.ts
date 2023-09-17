import { Request, Response } from 'express';
import { HttpsError } from './index';

export default (callback: (req: Request, res: Response) => Promise<void>) => async (req: Request, res: Response) => {
  try {
    await callback(req, res);
  } catch (error: unknown) {
    if (error instanceof HttpsError) {
      switch (error.code) {
        case 'invalid-argument':
          res.status(400).json({
            message: error.message,
          });
          break;
        case 'not-found':
          res.status(404).json({
            message: error.message,
          });
          break;
        case 'already-exists':
          res.status(409).json({
            message: error.message,
          });
          break;
        case 'permission-denied':
          res.status(403).json({
            message: error.message,
          });
          break;
        case 'unauthenticated':
          res.status(401).json({
            message: error.message,
          });
          break;
        case 'failed-precondition':
          res.status(400).json({
            message: error.message,
          });
          break;
        case 'aborted':
          res.status(409).json({
            message: error.message,
          });
          break;
        case 'out-of-range':
          res.status(400).json({
            message: error.message,
          });
          break;
        case 'unimplemented':
          res.status(501).json({
            message: error.message,
          });
          break;
        case 'internal' || 'data-loss':
          res.status(500).json({
            message: error.message,
          });
          break;
        case 'unavailable':
          res.status(503).json({
            message: error.message,
          });
          break;
        default:
          res.status(500).json({
            message: error.message,
          });
      }
    } else {
      console.error(error);
      res.status(500).json({
        error: 'Oops! Something went wrong.',
      });
    }
  }
};

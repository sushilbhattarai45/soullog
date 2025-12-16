import express from 'express';
import cors from 'cors';
import {
  getAllJournals,
  JournalPost,
  getOneUserEntries,
} from '../controllers/journalController.js';
const router = express.Router ();

router.post ('/post', JournalPost);

router.get ('/getAll', getAllJournals);
router.post ('/getOneUserEntries', getOneUserEntries);
export default router;

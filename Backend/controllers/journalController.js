import Journal from '../schema/journalSchema.js';
import express from 'express';
import cors from 'cors';
import {processJournal} from '../config/geminiCOnfig.js';
const router = express.Router ();

export const JournalPost = async (req, res) => {
  console.log ('hii');
  // console.log (req.body);

  let responseFromGenAI = await processJournal (req.body.content);
  let sendtoDB = new Journal ({
    content: req.body.content,
    emotion: responseFromGenAI.emotion,
    aiReview: responseFromGenAI.feedback,
    isAnonymous: req.body.isAnonymous,
    userId: req.body.userId,
    song: responseFromGenAI.song,
  });

  console.log(responseFromGenAI);
  let response = await sendtoDB.save ();

  res.send ({
    entryData: response,
    emotion: responseFromGenAI.emotion,
    song: responseFromGenAI.song,
    feedback: responseFromGenAI.feedback,
  });
};

export const getAllJournals = async (req, res) => {
  try {
    const journals = await Journal.find ();
    res.status (200).json (journals);
  } catch (error) {
    res.status (500).json ({message: 'Server Error', error: error.message});
  }
};

export const getOneUserEntries = async (req, res) => {
  try {
    console.log ('I am here');

    const {id} = req.body;
    console.log ('I am here');
    const userJournals = await Journal.find ({userId: id});
    console.log (userJournals + 'hii');
    res.status (200).json (userJournals);
  } catch (error) {
    res.status (500).json ({message: 'Server Error', error: error.message});
  }
};

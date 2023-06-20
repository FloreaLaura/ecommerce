import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';

const messageRoute = express.Router();

messageRoute.post(
  '/',
  isAuth,
  // const { body, name, isAdmin, userID } = req.body;
  expressAsyncHandler(async (req, res) => {
    const newMessage = new Message({
      body: req.body.body,
      name: req.body.name,
      isAdmin: req.body.isAdmin,
      userID: req.body.userID,
      selectedUserID: req.body.selectedUserID,
    });

    const message = await newMessage.save();
    res.status(201).send({ message: 'New Message Created', message });
  })

  // newMessage
  //   .save()
  //   .then((savedMessage) => {
  //     res.status(201).json(savedMessage);
  //   })
  //   .catch((error) => {
  //     res.status(500).json({ error: error.message });
  //   });
);

// Ruta pentru a citi toate mesajele
messageRoute.get('/', (req, res) => {
  Message.find()
    .then((messages) => {
      res.status(200).json(messages);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// Ruta pentru a actualiza un mesaj
messageRoute.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, body, isAdmin } = req.body;

  Message.findByIdAndUpdate(id, { name, body, isAdmin }, { new: true })
    .then((updatedMessage) => {
      res.status(200).json(updatedMessage);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// Ruta pentru a șterge un mesaj
messageRoute.delete('/:id', (req, res) => {
  const { id } = req.params;

  Message.findByIdAndDelete(id)
    .then(() => {
      res.status(200).json({ message: 'Mesajul a fost șters' });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

export default messageRoute;

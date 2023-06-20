import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import { isAuth, isAdmin } from '../utils.js';
import User from '../models/userModel.js';

const messageRouter = express.Router();

messageRouter.post(
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
);

messageRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const messages = await Message.find()
      // .populate('user', 'name')
      .sort({ createdAt: 1 });
    res.send(messages);
  })
);
// messageRouter.get(
//   '/mine',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const messages = await Message.find({ user: req.user._id }).sort({
//       createdAt: 1,
//     });
//     res.send(messages);
//   })
// );

// messageRouter.get(
//   '/',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const { isAdmin, _id } = req.user;

//     let messages;

//     if (isAdmin) {
//       messages = await Message.find({ isAdmin: true, selectedUserID: _id });
//     } else {
//       messages = await Message.find({ userID: _id });
//     }

//     res.send(messages);
//   })
// );

// messageRouter.get(
//   '/',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     let query = {};

//     if (!req.query.isAdmin) {
//       query = {
//         $or: [
//           { isAdmin: false, userID: req.query.userID },
//           { isAdmin: true, selectedUserID: req.query.userID },
//         ],
//       };
//     } else {
//       query = {
//         isAdmin: true,
//         selectedUserID: req.query.selectedUserID,
//       };
//     }

//     const messages = await Message.find(query).sort({ createdAt: 1 });
//     res.send(messages);
//   })
// );

// Ruta pentru a actualiza un mesaj
messageRouter.put('/:id', (req, res) => {
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
messageRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  Message.findByIdAndDelete(id)
    .then(() => {
      res.status(200).json({ message: 'Mesajul a fost șters' });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

export default messageRouter;

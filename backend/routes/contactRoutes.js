import express from 'express';
import Contact from '../models/contactModel.js';
import expressAsyncHandler from 'express-async-handler';

const contactRouter = express.Router();

contactRouter.get('/', async (req, res) => {
  const contacts = await Contact.find();
  res.send(contacts);
});

contactRouter.post('/', async (req, res) => {
  expressAsyncHandler(async (req, res) => {
    const newContact = new Contact({
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email,
      image: req.body.image,
    });
    const contact = await newContact.save();
    res.status(201).send({ message: 'New Contact Created', contact });
  });
});

export default contactRouter;

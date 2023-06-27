import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  phone: { type: String },
  address: { type: String },
  email: { type: String },
  image: { type: String },
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;

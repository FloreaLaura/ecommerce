import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

export const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000'
    : 'https://yourdomain.com';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

export const payOrderEmailTemplate = (order) => {
  return `<h2>Îți mulţumim că ai apelat la NaturShop şi pentru încrederea acordată magazinului nostru.</h2>
  <p>
  Bună, ${order.user.name},</p>
  <p>Comanda dumneavoastră este în curs de procesare. Găsiți mai jos detaliile comenzii.</p>
  <h2>[Comanda ${order._id}] (${order.createdAt
    .toString()
    .substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong align="left">Produse</strong></td>
  <td><strong align="center">Cantitate</strong></td>
  <td><strong align="right">Pret</strong></td>
  </thead>
  <tbody>
  ${order.orderItems
    .map(
      (item) => `
    <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right"> ${item.price.toFixed(2)} RON</td>
    </tr>
  `
    )
    .join('\n')}
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">Prețul articolelor:</td>
  <td align="right"> ${order.itemsPrice.toFixed(2)} RON</td>
  </tr>
  <tr>
  <td colspan="2">Taxe de transport:</td>
  <td align="right"> ${order.shippingPrice.toFixed(2)} RON</td>
  </tr>
  <tr>
  <td colspan="2"><strong>Pret total:</strong></td>
  <td align="right"><strong> ${order.totalPrice.toFixed(2)} RON</strong></td>
  </tr>
  <tr>
  <td colspan="2">Metoda de plata:</td>
  <td align="right">${order.paymentMethod}</td>
  </tr>
  </table>

  <h2>Detaliile comenzii:</h2>
  <p>
  Nume: ${order.shippingAddress.fullName}<br/>
  Adresa: ${order.shippingAddress.address}<br/>
  Oraș: ${order.shippingAddress.city}<br/>
  Țara: ${order.shippingAddress.country}<br/>
  Cod poștal: ${order.shippingAddress.postalCode}<br/>
  </p>
  <hr/>
  <p>
  Sperăm că te vei bucura de produsele noastre.<br/>

  Cu prietenie,<br/>
  Echipa NaturShop
  </p>
  `;
};

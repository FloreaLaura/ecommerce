export default function ContactScreen() {
  return (
    <div className="contact-container">
      <h2 className="contact-title">
        <img src="images/contact.png" alt="Icon" className="contact-icon" />
        Contact
      </h2>
      <div className="contact-details">
        <p className="contact-info">Telefon: 0723456789</p>
        <p className="contact-info">
          Adresa: Strada Naturii, nr. 1, Sector 3, Bucuresti (La aceasta adresa
          nu se lucreaza cu publicul!, efectuam doar comenzi online)
        </p>
        <p className="contact-info">Email: contact@naturshop.ro</p>
      </div>
      <img
        src="images/contact.jpg"
        alt="Imagine Contact"
        className="contact-image"
      />
    </div>
  );
}

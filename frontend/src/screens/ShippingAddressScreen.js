import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );

  const calculateDistance = () => {
    const lat1 = 44.44765998652836; // Latitudinea locației de bază
    const lon1 = 26.096736171342823; // Longitudinea locației de bază
    const lat2 = shippingAddress.location.lat; // Latitudinea adresei de livrare
    const lon2 = shippingAddress.location.lng; // Longitudinea adresei de livrare

    const R = 6371; // Raza Pământului în kilometri
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const timeInHours = Math.floor(distance / 50); // Partea întreagă a timpului estimat în ore
    const timeInMinutes = Math.round(((distance / 50) % 1) * 60); // Partea zecimală convertită în minute

    return {
      distance: distance.toFixed(2),
      time: {
        hours: timeInHours,
        minutes: timeInMinutes,
      },
    };
  };

  useEffect(() => {
    const shippingAddress = localStorage.getItem('shippingAddress');
    if (shippingAddress) {
      const parsedShippingAddress = JSON.parse(shippingAddress);
      setFullName(parsedShippingAddress.fullName || '');
      setAddress(parsedShippingAddress.address || '');
      setCity(parsedShippingAddress.city || '');
      setPostalCode(parsedShippingAddress.postalCode || '');
      setCountry(parsedShippingAddress.country || '');
    }
  }, []);

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);
  const [country, setCountry] = useState(shippingAddress.country || '');
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );
    navigate('/payment');
  };

  function navigateonMap() {
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );
    navigate('/map');
    window.location.reload();
  }

  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [ctxDispatch, fullBox]);

  return (
    <div>
      <Helmet>
        <title>Informatii livrare</title>
      </Helmet>

      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1
          className="my-3"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          Detalii livrare
        </h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Nume</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Adresa</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>Localitate</Form.Label>
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Cod postal</Form.Label>
            <Form.Control
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              pattern="\d{6}"
              title="Codul postal trebuie să conțină exact 6 cifre."
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Tara</Form.Label>
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button
              id="chooseOnMap"
              type="button"
              variant="light"
              onClick={navigateonMap}
              // {() => navigate('/map')}
            >
              Alege locatia pe harta
            </Button>
            {shippingAddress.location && shippingAddress.location.lat ? (
              <div style={{ display: 'block', fontWeight: 'bold' }}>
                {/* Latitudine: {shippingAddress.location.lat} <br />
                Longitudine:{shippingAddress.location.lng} */}
                <br /> Locație adăugată
                {shippingAddress.location.lat && (
                  <div>
                    Distanța de la furnizor la adresa aleasa:{' '}
                    {calculateDistance().distance} km
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>Fara locatie</div>
            )}
          </div>

          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continua
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

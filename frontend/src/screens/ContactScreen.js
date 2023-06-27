import React, { useEffect, useReducer, useState } from 'react';
import axios from 'axios';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, contacts: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ContactScreen() {
  const [{ loading, error, contacts }, dispatch] = useReducer(reducer, {
    contacts: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/contacts');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  return (
    <div className="contact-container">
      <h2 className="contact-title">
        <img src="images/contact.png" alt="Icon" className="contact-icon" />
        Contact
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="contact-details">
          {contacts.map((contact) => (
            <div key={contact._id}>
              <p className="contact-info">Telefon: {contact.phone}</p>
              <p className="contact-info">Adresa: {contact.address}</p>
              <p className="contact-info">Email: {contact.email}</p>
              <img
                src={`images/${contact.image}`}
                alt="Imagine Contact"
                className="contact-image"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

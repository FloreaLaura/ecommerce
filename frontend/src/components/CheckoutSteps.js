import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps">
      <Col className={props.step1 ? 'active' : ''}>Conecteaza-te</Col>
      <Col className={props.step2 ? 'active' : ''}>Livrare</Col>
      <Col className={props.step3 ? 'active' : ''}>Plata</Col>
      <Col className={props.step4 ? 'active' : ''}>Plaseaza comanda</Col>
    </Row>
  );
}

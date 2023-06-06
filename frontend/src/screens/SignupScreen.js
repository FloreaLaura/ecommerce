import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid');
      return;
    }
    try {
      const { data } = await Axios.post('/api/users/signup', {
        name,
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      toast.error('Exista deja un user asociat acestui email!');
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Inregistreaza-te</title>
      </Helmet>
      <h1
        className="my-3"
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Inregistreaza-te
      </h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Nume</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Parola</Form.Label>
          <div className="password-input">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle" onClick={handlePasswordToggle}>
              {showPassword ? <EyeSlashFill /> : <EyeFill />}
            </span>
          </div>
          <Form.Group
            className="mb-3 custom-form-group"
            controlId="confirmPassword"
          >
            <Form.Label>Confirma Parola</Form.Label>
            <div className="password-input">
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="password-toggle"
                onClick={handleConfirmPasswordToggle}
              >
                {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
              </span>
            </div>
          </Form.Group>
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Inregistreaza-te</Button>
        </div>
        <div className="mb-3">
          Ai deja un cont?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Conecteaza-te</Link>
        </div>
      </Form>
    </Container>
  );
}

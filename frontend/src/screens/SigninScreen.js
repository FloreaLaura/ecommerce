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

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post('/api/users/signin', {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
      window.location.reload();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Conecteaza-te</title>
      </Helmet>
      <h1
        className="my-3"
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Conecteaza-te
      </h1>
      <Form onSubmit={submitHandler}>
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
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Logheaza-te</Button>
        </div>
        <div className="mb-3">
          Client nou?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Creeaza cont</Link>
        </div>
        <div className="mb-3">
          Ai uitat parola? <Link to={`/forget-password`}>Reseteaza parola</Link>
        </div>
      </Form>
    </Container>
  );
}

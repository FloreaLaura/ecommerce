import Axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo || !token) {
      navigate('/');
    }
  }, [navigate, userInfo, token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid');
      return;
    }
    try {
      await Axios.post('/api/users/reset-password', {
        password,
        token,
      });
      navigate('/signin');
      toast.success('Parola a fost actualizata cu succes');
    } catch (err) {
      toast.error(getError(err));
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

  return (
    <Container className="small-container">
      <Helmet>
        <title>Reseteaza parola</title>
      </Helmet>
      <h1
        className="my-3"
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Reseteaza parola
      </h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Parola noua</Form.Label>
          <div className="password-input">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle" onClick={handlePasswordToggle}>
              {showPassword ? <EyeSlashFill /> : <EyeFill />}
            </span>
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirma parola noua</Form.Label>
          <div className="password-input">
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={handleConfirmPasswordToggle}
            >
              {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
            </span>
          </div>
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Reseteaza</Button>
        </div>
      </Form>
    </Container>
  );
}

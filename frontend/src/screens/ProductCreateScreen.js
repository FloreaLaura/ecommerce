import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export default function ProductCreateScreen() {
  const navigate = useNavigate();
  const params = useParams();

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const rating = 0;
  const numReviews = 0;

  const createHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/api/products/create', {
        name,
        slug,
        price,
        image,
        images,
        category,
        countInStock,
        brand,
        description,
        numReviews,
        rating,
      });
      navigate(`/admin/products`);
    } catch (err) {
      toast.error('Completati corect toate campurile!');
    }
  };

  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });

      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success('Imaginea a fost adaugata cu succes.');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };
  const deleteFileHandler = async (fileName, f) => {
    console.log(fileName, f);
    console.log(images);
    console.log(images.filter((x) => x !== fileName));
    setImages(images.filter((x) => x !== fileName));
    toast.success('Imaginea a fost eliminata cu succes.');
  };
  return (
    <Container className="small-container">
      <Form>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Denumire</Form.Label>
          <Form.Control
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="slug">
          <Form.Label>ID produs</Form.Label>
          <FloatingLabel
            controlId="floatingTextarea"
            label="Formatul ID-ului este de tipul: denumire-produs"
            className="mb-3"
          >
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              pattern=".*-.*"
              required
            />
          </FloatingLabel>
        </Form.Group>

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Pret</Form.Label>
          <Form.Control
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="image">
          <Form.Label>Fisierul imaginii</Form.Label>
          <Form.Control
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="imageFile">
          <Form.Label>Incarca imagine</Form.Label>
          <Form.Control type="file" onChange={uploadFileHandler} />
          {loadingUpload && <LoadingBox></LoadingBox>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="additionalImage">
          <Form.Label>Fisierul Imagine suplimentara</Form.Label>
          {images.length === 0 && <MessageBox>Nicio imagine</MessageBox>}
          <ListGroup variant="flush">
            {images.map((x) => (
              <ListGroup.Item key={x}>
                {x}
                <Button variant="light" onClick={() => deleteFileHandler(x)}>
                  <i className="fa fa-times-circle"></i>
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>
        <Form.Group className="mb-3" controlId="additionalImageFile">
          <Form.Label>Incarca imaginea suplimentara</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => uploadFileHandler(e, true)}
          />
          {loadingUpload && <LoadingBox></LoadingBox>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Categorie</Form.Label>
          <Form.Control
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Selectați o categorie</option>
            <option value="Ceai">Ceai</option>
            <option value="Sirop">Sirop</option>
            <option value="Suplimente">Suplimente</option>
            <option value="Ulei">Ulei</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="brand">
          <Form.Label>Producator</Form.Label>
          <Form.Control
            as="select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          >
            <option value="">Selectați producatorul</option>
            <option value="DACIA PLANT">DACIA PLANT</option>
            <option value="YOGI TEA">YOGI TEA</option>
            <option value="Sonnentor">Sonnentor</option>
            <option value="Arom Science">Arom Science</option>
            <option value="Parapharm">Parapharm</option>
            <option value="PlantExtrakt">PlantExtrakt</option>
            <option value="ADAMS VISION">ADAMS VISION</option>
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3" controlId="countInStock">
          <Form.Label>Produse in stoc</Form.Label>
          <Form.Control
            value={countInStock}
            onChange={(e) => setCountInStock(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Descriere</Form.Label>
          <Form.Control
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <div className="mb-3">
          <Button
            disabled={loadingUpdate}
            type="submit"
            onClick={createHandler}
          >
            Adauga
          </Button>
          {loadingUpdate && <LoadingBox></LoadingBox>}
        </div>
      </Form>
    </Container>
  );
}

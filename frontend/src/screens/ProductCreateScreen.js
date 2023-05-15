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
  const params = useParams(); // /product/:id
  const { id: productId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
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

  //   const createProduct = async (productData) => {
  //     try {
  //       const response = await axios.post('/api/products/create', productData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Authorization: `Bearer ${userInfo.token}`,
  //         },
  //       });
  //       return response.data;
  //     } catch (error) {
  //       console.log(error);
  //       return { error: error.response.data.message || error.message };
  //     }
  //   };

  //   const createHandler = async (e) => {
  //     e.preventDefault();
  //     try {
  //       dispatch({ type: 'FETCH_REQUEST' });
  //       const data = new FormData();
  //       data.append('name', name);
  //       data.append('slug', slug);
  //       data.append('price', price);
  //       data.append('image', image);
  //       data.append('images', images);
  //       data.append('category', category);
  //       data.append('countInStock', countInStock);
  //       data.append('brand', brand);
  //       data.append('description', description);
  //       const result = await createProduct(data);
  //       dispatch({ type: 'FETCH_SUCCESS' });
  //       toast.success(result.message);
  //       navigate('/admin/products');
  //     } catch (err) {
  //       dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
  //       toast.error(getError(err));
  //     }
  //   };

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
      toast.error(getError(err));
    }
  };

  //   const createHandler = async () => {
  //     console.log('name: ', name, slug, price);
  //     if (window.confirm('Are you sure to create?')) {
  //       try {
  //         dispatch({ type: 'CREATE_REQUEST' });
  //         const { data } = await axios.post(
  //           '/api/products/create',
  //           {
  //             name,
  //             slug,
  //             price,
  //             image,
  //             images,
  //             category,
  //             countInStock,
  //             brand,
  //             description,
  //           },
  //           {
  //             headers: { Authorization: `Bearer ${userInfo.token}` },
  //           }
  //         );
  //         toast.success('product created successfully');
  //         dispatch({ type: 'CREATE_SUCCESS' });
  //         navigate(`/admin/products`);
  //       } catch (err) {
  //         toast.error(getError(error));
  //         dispatch({
  //           type: 'CREATE_FAIL',
  //         });
  //       }
  //     }
  //   };

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
      toast.success('Image uploaded successfully. click Update to apply it');
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
    toast.success('Image removed successfully. click Update to apply it');
  };
  return (
    <Container className="small-container">
      <Form>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="slug">
          <Form.Label>Slug</Form.Label>
          <Form.Control
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Price</Form.Label>
          <Form.Control
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="image">
          <Form.Label>Image File</Form.Label>
          <Form.Control
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="imageFile">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" onChange={uploadFileHandler} />
          {loadingUpload && <LoadingBox></LoadingBox>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="additionalImage">
          <Form.Label>Additional Images</Form.Label>
          {images.length === 0 && <MessageBox>No image</MessageBox>}
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
          <Form.Label>Upload Aditional Image</Form.Label>
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
          <Form.Label>Brand</Form.Label>
          <Form.Control
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="countInStock">
          <Form.Label>Count In Stock</Form.Label>
          <Form.Control
            value={countInStock}
            onChange={(e) => setCountInStock(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
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
            Update
          </Button>
          {loadingUpdate && <LoadingBox></LoadingBox>}
        </div>
      </Form>
    </Container>
  );
}

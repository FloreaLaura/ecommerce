import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

function Product(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Scuze. Produsul nu este in stoc.');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  return (
    <Card className="rec-rounded-card ">
      <Link to={`/product/${product.slug}`}>
        <img
          src={product.image}
          className="rec-card-img-top"
          alt={product.name}
        />
      </Link>
      <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <Link to={`/product/${product.slug}`}>
          <Card.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {product.name}
          </Card.Title>
        </Link>
        <Rating
          rating={product.rating}
          numReviews={product.numReviews}
          style={{ fontSize: '14px', color: 'gold' }}
        />
        <Card.Text
          style={{
            fontSize: '18px',
            color: 'dark-grey',
            marginTop: '5px',
            marginBottom: '1px',
          }}
        >
          {product.price} RON
        </Card.Text>
        {product.countInStock === 0 ? (
          <Button
            variant="light"
            disabled
            style={{
              backgroundColor: '#f8f9fa',
              pointerEvents: 'auto',
              width: '100%',
              marginTop: '1px',
            }}
          >
            Nu este in stoc
          </Button>
        ) : (
          <Button
            onClick={() => addToCartHandler(product)}
            style={{
              color: '#212529',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'none',
              textDecoration: 'none',
              transition:
                'background-color 0.3s, color 0.3s, border-color 0.3s',
              pointerEvents: 'auto',
              width: '100%',
              marginTop: '1px',
            }}
          >
            Adauga in cos
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
export default Product;

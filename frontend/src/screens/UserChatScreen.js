import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  useContext,
} from 'react';
import socketIOClient from 'socket.io-client';
import { Store } from '../Store';
import axios from 'axios';

const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:4000'
    : window.location.host;

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

function UserChatScreen(props) {
  const { userInfo } = props;
  const [socket, setSocket] = useState(null);
  const uiMessagesRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([
    {
      name: 'Admin',
      body: 'Buna ziua, sunt aici pentru a va raspunde la intrebari.',
    },
  ]);
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
    if (!socket) {
      const sk = socketIOClient(ENDPOINT);
      setSocket(sk);
    }
    if (socket) {
      socket.emit('onLogin', {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });
      socket.on('message', (data) => {
        setMessages([...messages, { body: data.body, name: data.name }]);
      });
    }
  }, [messages, isOpen, socket]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert('Scrie un mesaj.');
    } else {
      setMessages([...messages, { body: messageBody, name: userInfo.name }]);
      setMessageBody('');

      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/messages',
          {
            body: messageBody,
            name: userInfo.name,
            isAdmin: userInfo.isAdmin,
            userID: userInfo._id,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        console.log('Mesajul a fost trimis cu succes:', data);
        dispatch({ type: 'CREATE_SUCCESS' });
      } catch (error) {
        console.error('Eroare la trimiterea mesajului:', error);
        dispatch({ type: 'CREATE_FAIL' });
      }
    }
  };

  return (
    <div className="bigBox">
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        Chat cu administratorul
      </h2>
      <div className="chatbox">
        <div className="userChatBox">
          <div className="row position-relative"></div>
          <ul ref={uiMessagesRef}>
            {messages.map((msg, index) => (
              <li key={index}>
                <strong>{`${msg.name}: `}</strong> {msg.body}
              </li>
            ))}
          </ul>

          <div>
            <form onSubmit={submitHandler}>
              <input
                className="writeHere"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                type="text"
                placeholder="Scrie mesajul aici..."
              />
              <button type="submit">Trimite</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserChatScreen;

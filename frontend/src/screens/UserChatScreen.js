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
import { getError } from '../utils';

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
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, messages: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
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
  const [{ loading, messages }, dispatch] = useReducer(reducer, {
    loading: false,
    messages: [],
  });
  const chatboxRef = useRef(null);

  const filteredMessages = messages.filter((msg) => {
    if (msg.isAdmin) {
      return msg.selectedUserID === userInfo._id;
    } else {
      return msg.userID === userInfo._id;
    }
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const fetchMessages = async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      let queryParams = {};

      if (!userInfo.isAdmin) {
        queryParams = {
          $or: [
            { isAdmin: false, userID: userInfo._id },
            { isAdmin: true, selectedUserID: userInfo._id },
          ],
        };
      } else {
        queryParams = {
          isAdmin: true,
          selectedUserID: userInfo._id,
        };
      }

      const response = await axios.get('/api/messages', {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
        params: queryParams,
      });

      const filteredMessages = response.data.filter((msg) => {
        if (msg.isAdmin) {
          return msg.selectedUserID === userInfo._id;
        } else {
          return msg.userID === userInfo._id;
        }
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: filteredMessages });
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
    }
  };

  useEffect(() => {
    const chatboxElement = chatboxRef.current;

    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        bottom: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
    // if (chatboxElement) {
    //   const chatboxElement = chatboxRef.current;
    //   chatboxElement.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    // }
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
      fetchMessages();

      socket.on('message', (data) => {
        const newMessage = { body: data.body, name: data.name };
        const updatedMessages = [...messages, newMessage];

        const filteredMessages = updatedMessages.filter((msg) => {
          if (msg.isAdmin) {
            return msg.selectedUserID === userInfo._id;
          } else {
            return msg.userID === userInfo._id;
          }
        });
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: filteredMessages,
        });
        fetchMessages();
      });
    }
  }, [userInfo, socket]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert('Scrie un mesaj.');
    } else {
      const newMessage = { body: messageBody, name: userInfo.name };
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: [...filteredMessages, newMessage],
      });
      setMessageBody('');

      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/messages',
          {
            body: newMessage.body,
            name: newMessage.name,
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
    setTimeout(() => {
      socket.emit('onMessage', {
        body: messageBody,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
        _id: userInfo._id,
      });
    }, 1000);
    fetchMessages();
  };

  return (
    <div className="bigBox">
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
        Chat cu administratorul
      </h2>
      <small>(Mesajele dispar automat după 12 ore)</small>

      <div className="chatbox" ref={chatboxRef}>
        <div className="userChatBox">
          <div className="row position-relative"></div>
          <ul ref={uiMessagesRef}>
            {filteredMessages.map((msg, index) => (
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

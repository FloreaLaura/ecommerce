import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  MarkerF,
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ['places'];

export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation os not supported by this browser');
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  const onMapClick = (event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedLocation(clickedLocation);
    setIsLocationSelected(true);
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await axios('/api/keys/google', {
        headers: { Authorization: `BEARER ${userInfo.token}` },
      });
      setGoogleApiKey(data.key);
      getUserCurrentLocation();
    };

    fetch();
    ctxDispatch({
      type: 'SET_FULLBOX_ON',
    });
  }, [ctxDispatch]);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setCenter({ lat: place.lat(), lng: place.lng() });
    setLocation({ lat: place.lat(), lng: place.lng() });
  };

  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  const onConfirm = () => {
    if (!isLocationSelected) {
      toast.error('Alegeti adresa pentru a confirma.');
      return;
    }

    const places = placeRef.current.getPlaces() || [{}];
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });
    toast.success('Locatia a fost selectata cu succes.');
    navigate('/shipping');
  };

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="smaple-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
          onClick={onMapClick}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <div className="map-input-box">
              <input
                type="text"
                placeholder="Alegeti adresa dorita"
                style={{ display: 'none', opacity: 0 }}
              ></input>
              <Button
                type="button"
                className="btnConfirmAdress"
                onClick={onConfirm}
              >
                Confirm
              </Button>
            </div>
          </StandaloneSearchBox>
          {console.log(selectedLocation)}
          <MarkerF position={selectedLocation} onLoad={onMarkerLoad}></MarkerF>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

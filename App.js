import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Header} from 'react-native-elements';
import YaMap, {Polyline} from 'react-native-yamap';
import GetLocation from 'react-native-get-location';
import Icon from 'react-native-vector-icons/Ionicons';

YaMap.init('5fad4806-1606-4f4d-b37d-18130ac235bd');

const Map = () => {
  const [points, setPoints] = useState([]);
  const [firstLocation, setFirstLocation] = useState();
  const [trackingStatus, setTrackingStatus] = useState(false);
  const [dot, setDot] = useState(false);
  const [time, setTime] = useState('-');
  const [distance, setDistance] = useState('-');
  const mapRef = useRef(null);

  console.log(points, firstLocation, trackingStatus, dot, time, distance);

  const distanceBetween = (first, second) => {
    let distance =
      Math.sqrt(
        Math.pow(second.lat - first.lat, 2) +
          Math.pow(second.lon - first.lon, 2),
      ) * 100000;
    setDistance(distance.toFixed(2));
    return distance;
  };

  const centerAndZoom = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })
      .then((location) => {
        setFirstLocation({lat: location.latitude, lon: location.longitude});
      })
      .catch((error) => {
        const {code, message} = error;
        console.warn(code, message);
      });
  };

  const getMyLocation = () => {
    if (trackingStatus)
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      })
        .then((location) => {
          console.log(location);
          setPoints([
            ...points,
            {lat: location.latitude, lon: location.longitude},
          ]);
          setDot(!dot);
        })
        .catch((error) => {
          const {code, message} = error;
          console.warn(code, message);
          setDot(!dot);
        });
  };

  const getPeriod = (distance) => {
    let time = 0;
    if (1.5 < distance < 2.5) time = 1689;
    if (0.5 < distance < 1.5) time = 3525;
    if (distance < 0.5) time = 5000;
    setTime(Math.trunc(time));
    return time;
  };

  useEffect(() => {
    if (trackingStatus) {
      setDot(!dot);
    }
  }, [trackingStatus]);

  useEffect(() => {
    let distance = 0;
    if (points.length > 1) {
      let lastPoint = points.length - 1;
      distance = distanceBetween(points[lastPoint - 1], points[lastPoint]);
    }
    setTimeout(() => getMyLocation(), getPeriod(distance));
  }, [dot]);

  useEffect(() => centerAndZoom(), []);
  useEffect(() => {
    mapRef.current.setCenter(firstLocation, 17);
    console.log(firstLocation);
  }, [firstLocation]);

  return (
    <>
      <Header
        placement="center"
        leftComponent={<Icon name="menu" color="#fff" />}
        centerComponent={{text: 'Track Your Way', style: {color: '#fff'}}}
        rightComponent={<Icon name="home" color="#fff" />}
      />
      <YaMap
        // onMapPress={(point) => {
        //   console.log(point.nativeEvent);
        //   setFirstDot(point.nativeEvent);
        // }}
        // onMapLongPress={(point) => {
        //   console.log(point.nativeEvent);
        //   setSecondDot(point.nativeEvent);
        // }}
        ref={mapRef}
        nightMode={false}
        userLocationIcon={require('./src/img/pin.png')}
        style={styles.yamap}>
        <Polyline points={points} strokeColor="red" strokeWidth={3} />
      </YaMap>
      <View style={styles.info}>
        <Text style={styles.text}>Расстояние: {distance}</Text>
        <Text style={styles.text}>Интервал: {time}</Text>
      </View>
      <Button
        title="Начать отслеживание"
        buttonStyle={styles.button}
        onPress={() => {
          setTrackingStatus(!trackingStatus);
        }}
      />
    </>
  );
};

export const styles = StyleSheet.create({
  yamap: {
    flex: 1,
  },
  button: {
    height: 50,
  },
  info: {
    height: 50,
    backgroundColor: '#3198ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    marginHorizontal: 10,
  },
});

export default Map;

// const doRoute = () => {
//   mapRef.current.findPedestrianRoutes([firstDot, secondDot], (event) => {
//     setPoints(event.nativeEvent.routes[0].sections[0].points);
//   });
// };

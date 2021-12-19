import React, { useState, useEffect } from "react";
import { Button, StyleSheet, TouchableOpacity } from "react-native";
import io, { Socket } from "socket.io-client";

import { Text, View, TextInput } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import Block from "../components/Block";
import { useThemeColor } from "../components/Themed";


export default function Login({ navigation }: RootStackScreenProps<"Login">) {
  const backgroundColor = useThemeColor({}, "background");
  const [playerName, setPlayerName] = useState<string>('');
  const [roomName,setRoomName]=useState('')
  const [socket, setSocket] = useState<undefined | Socket>();

  useEffect(() => {
    const remote = "https://agile-everglades-10098.herokuapp.com/";
    const local = "http://192.168.1.54:3000/";

    const socketConn = io(local);
    console.log(socketConn)
    setSocket(socketConn);
  
  }, []);

useEffect(()=>{
  socket?.on("connect", () => {
    console.warn("connected");
  });
},[socket])

  const createRoom = () => {
    socket?.emit("create room", playerName);
    socket?.on("room created", ({ roomName }) => {
      navigation.navigate('Board', {
        socket,
        roomName: roomName,
        player1 :playerName
      });
    });
  };
  
   const joinRoom = () => {
      socket?.emit("join room", { roomName, player2:playerName });
      socket?.on("player2 joined", ({ player2, roomName }) => {
        navigation.navigate("Board", {
          socket,
          player2,
          roomName
        });
      });
    };

  return (
    <Block flex>
      <Block flex={1} center>
        <Text style={styles.text}>Enter Your Name And Room Number</Text>
      </Block>

      <Block center flex={2}>
        <TextInput
          placeholderTextColor={backgroundColor}
          placeholder="Enter Your Name"
          style={styles.input}
          onChangeText={setPlayerName}
        />
        <TextInput
          placeholderTextColor={backgroundColor}
          placeholder="Enter Room Number"
          style={styles.input}
          onChangeText={setRoomName}
        />
      </Block>

      <Block row flex={3} top space="evenly">
        <Block
          onPress={createRoom}
          padding={[0, 20]}
          touchable
          style={styles.touchable}
          height={50}
          center
          card
        >
          <Text style={styles.text}>Create Room</Text>
        </Block>
        <Block
          onPress={joinRoom}
          padding={[0, 20]}
          touchable
          style={styles.touchable}
          height={50}
          center
          card
        >
          <Text style={styles.text}>Join Room</Text>
        </Block>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  touchable: {
    fontSize: 25,
    borderWidth: 2,
  },
  text: {
    fontSize: 24,
  },
  input: {
    fontSize: 20,
    width: "70%",
    height: 40,
    borderRadius: 20,
    paddingLeft: 15,
    borderColor: "transparent",
    marginBottom: 40,
  },
});

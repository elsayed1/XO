import React, { useState, useEffect } from "react";
import { StyleSheet, ToastAndroid,Modal, Alert, Button,Platform } from "react-native";

import { Text } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import { Block } from "react-native-block-component";
import { useThemeColor } from "../components/Themed";
import Square from "../components/Square";

type Row = [string, string, string];
type Board = [Row, Row, Row];

export default function Board({
  navigation,
  route,
}: RootStackScreenProps<"Board">) {

  const backgroundColor = useThemeColor({}, "background");
  const { roomName, socket, player1: p1, player2: p2 } = route.params;
  const currentUser = p1 || p2;
  const [player1, setPlayer1] = useState<string | undefined>(p1);
  const [player2, setPlayer2] = useState(p2);
  const [board, setBoard] = useState();
  const [playerTurn, setPlayerTurn] = useState();
  const [winner, setWinner] = useState(null);
  const [modalVisible,setModalVisible] = useState(false)

  useEffect(() => {
    socket.on("player2 joined", ({ player2,player1, roomName }) => {
      setPlayer2(player2);
      socket.emit("initNewGame", {  roomName });
    });

    socket.on("newGameStarted", ({board, playerTurn,player1}) => {
      setModalVisible(false)
     setPlayer1(player1);
     setBoard(board);
     setPlayerTurn(playerTurn); 
    });


 socket.on("turnPlayed", ({board,playerTurn}) => {
    setPlayerTurn(playerTurn);
    setBoard(board);    
  });
  
  socket.on("gameOver",({winner})=>{
    console.log(winner,'winner')
    setWinner(winner);
    setModalVisible(true)
  })

  }, []);
 
  const renderBoard = (board: Board) => {
    if (!board) return;
    return board.map((row, r) => {
      return (
        <Block row key={r}>
          {row.map((square, c) => {
            return (
              <Square
                key={[r, c].toString()}
                value={square}
                onPress={() => squareClick(r, c)}
              />
            );
          })}
        </Block>
      );
    });
  };


  const squareClick = (r, c) => {
    if (!board) return;
    if (currentUser !== playerTurn)
     return ToastAndroid.show("this is not your turn", ToastAndroid.SHORT);

    if (board[r][c])
      return ToastAndroid.show("this square is filled", ToastAndroid.SHORT);

    // Emit an event to update other player that you've played your turn.
    socket.emit("playTurn", {
      tile: { r, c },
       roomName,
    });

  };

  return (
    <Block flex>
       <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <Block center flex >
          <Block flex={.2} width={300} center  backgroundColor='white'  padding={10} shadow style={{borderRadius:10}}>
            <Block flex  center>
            <Text style={styles.text}>{winner ?currentUser === winner?"You Win" :"You Lost" :'Even'}</Text>
            </Block>
          <Block center   card touchable padding={[10,30]}  onPress={()=>socket.emit('initNewGame',{roomName})}>
            <Text style={styles.text}>Play Again</Text>
          </Block>
          </Block>
        </Block>
      </Modal>
      <Block padding={10} row space="between" center>
        <Text style={styles.text}>{player1}</Text>
        <Text style={styles.text}> {player2}</Text>
      </Block>
      <Block center>
        <Text style={styles.text}>Board {roomName}</Text>
        <Text style={styles.text}>{currentUser===playerTurn ?'Your Turn' : 'Waiting...'}</Text>
      </Block>
      <Block center flex>
        {renderBoard(board)}
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
});

import React, { useState, useEffect } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

import { Text, View, TextInput } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import Block from "../components/Block";
import { useThemeColor } from "../components/Themed";
import Square from "../components/Square";

type Row = [string, string, string];
type Board = [Row, Row, Row];

export default function Board({
  navigation,
  route,
}: RootStackScreenProps<"Board">) {
  const boardInitial: Board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  const backgroundColor = useThemeColor({}, "background");
  const { roomName, socket, player1: p1, player2: p2 } = route.params;
  const currentUser = p1 || p2;
  console.log(socket);
  const [player1, setPlayer1] = useState<string | undefined>(p1);
  const [player2, setPlayer2] = useState(p2);
  const [board, setBoard] = useState();
  const [playerTurn, setPlayerTurn] = useState();
  console.log({currentUser}, {playerTurn});

  useEffect(() => {
    socket.on("player2 joined", ({ player2, roomName }) => {
      setPlayer2(player2);
      socket.emit("cast player1", { player1, roomName });
    });

    socket.on("player1 name", ({ player1, roomName }) => {
      initNewGame(player1);
    });
 socket.on("turnPlayed", ({ tile }) => {
    console.log({playerTurn,player1})
    setBoard((state) => {
      console.log(state);
      state[tile.r][tile.c] = playerTurn === player1 ? "X" : "O";
      return [...state];
    });
    setPlayerTurn(state=>state === player1 ? player2 : player1);
    //  let newBoard = [...board];
    //  newBoard[0][0] = "O";
    //  console.log(newBoard)
    //  setBoard(newBoard);

    // this.getWinner(newBoard);
    // this.setState({ board: newBoard, playTurn: true, header: "your turn" });
  });
  
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

  const getWhoStart = () => (Math.round(Math.random()) ? player1 : player2);

  const togglePlayerTurn = () =>
    setPlayerTurn(playerTurn === player1 ? player2 : player1);

  const initNewGame = (player1) => {
    setBoard(boardInitial);
    setPlayer1(player1);
    setPlayerTurn(player1);
  };

  const squareClick = (r, c) => {
    console.log({currentUser}, {playerTurn}, {player1});
    if (!board) return;
    // Emit an event to update other player that you've played your turn.
    if (currentUser !== playerTurn)
    return console.log('this is not your turn')
     // return ToastAndroid.show("this is not your turn", ToastAndroid.SHORT);

    if (board[r][c])
    return console.log('this square is filled')

     // return ToastAndroid.show("this square is filled", ToastAndroid.SHORT);

    socket.emit("playTurn", {
      tile: { r, c },
      room: roomName,
    });

    // this.getWinner(newBoard);
    // this.setState({
    //   board: newBoard,
    //   playTurn: false,
    //   header: `waiting for player`,
    // });
  };

  return (
    <Block flex>
      <Block padding={10} row space="between" center>
        <Text style={styles.text}>{player1}</Text>
        <Text style={styles.text}> {player2}</Text>
      </Block>
      <Block center>
        <Text style={styles.text}>Board {roomName}</Text>
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

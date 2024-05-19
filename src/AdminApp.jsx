import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const AdminApp = () => {
  const [question, setQuestion] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on('question', (newQuestion) => {
      setQuestion(newQuestion.question); // Ensure accessing the question property
    });

    socket.on('playerList', (players) => {
      setPlayers(players); // Update player list in real-time
    });

    return () => {
      socket.off('question');
      socket.off('playerList');
    };
  }, []);

  const nextQuestion = () => {
    socket.emit('nextQuestion');
  };

  const prevQuestion = () => {
    socket.emit('prevQuestion');
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <div>
        <h2>Current Question: {question}</h2>
      </div>
      <button onClick={prevQuestion}>Previous Question</button>
      <button onClick={nextQuestion}>Next Question</button>
      <h2>Connected Players</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminApp;
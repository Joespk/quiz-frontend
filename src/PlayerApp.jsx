import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const PlayerApp = () => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('question', (data) => {
      setQuestion(data.question);
      setChoices(data.choices);
      setSelectedAnswer('');
      setResult(null); // รีเซ็ตผลลัพธ์สำหรับคำถามใหม่
      setIsSubmitted(false); // อนุญาตให้ส่งสำหรับคำถามใหม่
    });

    socket.on('answerResult', (data) => {
      setResult(data.isCorrect ? 'Correct!' : data.message || 'Incorrect!');
    });

    return () => {
      socket.off('question');
      socket.off('answerResult');
    };
  }, []);

  const submitAnswer = () => {
    const timestamp = new Date().toISOString();
    socket.emit('submitAnswer', { name, answer: selectedAnswer, timestamp });
    setIsSubmitted(true);
  };

  const handleJoin = () => {
    if (name.trim()) {
      socket.emit('join', name);
      setIsConnected(true);
    } else {
      alert("Please enter your name before connecting.");
    }
  };

  return (
    <div>
      <h1>Quiz Game</h1>
      {!isConnected ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleJoin}>Connect</button>
        </div>
      ) : (
        <div>
          <p>{question}</p>
          <div>
            {choices.map((choice, index) => (
              <label key={index}>
                <input
                  type="radio"
                  value={choice}
                  checked={selectedAnswer === choice}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isSubmitted}
                />
                {choice}
              </label>
            ))}
          </div>
          <button onClick={submitAnswer} disabled={isSubmitted}>Submit Answer</button>
          {result && <p>{result}</p>}
        </div>
      )}
    </div>
  );
};

export default PlayerApp;
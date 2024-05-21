import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://metal-earthy-space.glitch.me", {
  path: "/socket.io",
  transports: ["websocket", "polling"], // เพิ่ม WebSocket transport อย่างชัดเจน
});

socket.on("connect", () => {
  console.log("Connected to the server");
});

socket.on("connect_error", (error) => {
  console.error("Connection Error:", error);
});

socket.on("disconnect", (reason) => {
  console.log(`Disconnected from server: ${reason}`);
});

const AdminApp = () => {
  const [question, setQuestion] = useState("");
  const [players, setPlayers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question index
  const [totalQuestions, setTotalQuestions] = useState(0); // Track total number of questions

  useEffect(() => {
    socket.on("question", (newQuestion) => {
      setQuestion(newQuestion.question);
      setCurrentQuestionIndex(newQuestion.index); // Set current question index
    });

    socket.on("playerList", (players) => {
      setPlayers(players);
    });

    socket.on("quizStarted", (totalQuestions) => {
      setQuizStarted(true);
      setTotalQuestions(totalQuestions); // Set total number of questions when quiz starts
    });

    socket.on("quizEnded", () => {
      setQuizStarted(false);
    });

    return () => {
      socket.off("question");
      socket.off("playerList");
      socket.off("quizStarted");
      socket.off("quizEnded");
    };
  }, []);

  const startQuiz = () => {
    socket.emit("startQuiz");
  };

  const endQuiz = () => {
    socket.emit("endQuiz");
  };

  const nextQuestion = () => {
    socket.emit("nextQuestion");
  };

  const prevQuestion = () => {
    socket.emit("prevQuestion");
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      {!quizStarted ? (
        <button onClick={startQuiz}>Start Quiz</button>
      ) : (
        <div>
          <h2>Current Question: {question}</h2>
          <button onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
            Previous Question
          </button>
          <button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
          >
            Next Question
          </button>
          {currentQuestionIndex === totalQuestions - 1 && (
            <button onClick={endQuiz}>End Quiz</button>
          )}
        </div>
      )}
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

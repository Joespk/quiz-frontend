import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios"; // นำเข้า axios

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

const PlayerApp = () => {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [notification, setNotification] = useState(null); // State for notification
  const timerRef = useRef(null);
  const startTimeRef = useRef(null); // To store the start time of the question

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("question", (data) => {
      setQuestion(data.question);
      setChoices(data.choices);
      setSelectedAnswer("");
      setResult(null); // Reset result for new question
      setIsSubmitted(false); // Allow submission for new question
      setTimeRemaining(30); // Reset timer for new question
      setNotification(null); // Clear any previous notifications

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Store the start time of the question
      startTimeRef.current = new Date();

      // Start the countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsSubmitted(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    });

    socket.on("answerResult", async (data) => {
      setResult(data.isCorrect ? "Correct!" : data.message || "Incorrect!");

      // Fetch and display summary after receiving the result
      if (data.isCorrect) {
        await fetchSummary();
      }
    });

    socket.on("quizStarted", () => {
      setQuizStarted(true);
    });

    socket.on("quizEnded", () => {
      setQuizStarted(false);
      setQuestion("");
      setChoices([]);
      setResult("The quiz has ended.");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });

    return () => {
      socket.off("question");
      socket.off("answerResult");
      socket.off("quizStarted");
      socket.off("quizEnded");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        "https://metal-earthy-space.glitch.me/summary"
      );
      const summary = response.data;

      // Find the fastest correct answer for the current question
      const currentSummary = summary.find((item) => item.question === question);
      if (currentSummary && currentSummary.fastestAnswer) {
        const { name, timeAnswered } = currentSummary.fastestAnswer;
        setNotification(
          `Fastest correct answer: ${name} - Time answered: ${timeAnswered} seconds`
        );
        setTimeout(() => {
          setNotification(null);
        }, 30000); // Clear notification after 30 seconds
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      alert("Please select an answer before submitting.");
      return;
    }
    const timestamp = new Date().toISOString();
    const timeAnswered = (new Date() - startTimeRef.current) / 1000; // Time answered in seconds
    socket.emit("submitAnswer", {
      name,
      answer: selectedAnswer,
      timestamp,
      timeAnswered,
    });
    setIsSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Fetch summary after submitting answer
    fetchSummary();
  };

  const handleJoin = () => {
    if (name.trim()) {
      socket.emit("join", name);
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
          {quizStarted ? (
            <>
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
              <button onClick={submitAnswer} disabled={isSubmitted}>
                Submit Answer
              </button>
              {result && <p>{result}</p>}
              <p>Time remaining: {timeRemaining} seconds</p>
            </>
          ) : (
            <p>Waiting for the quiz to start...</p>
          )}
        </div>
      )}
      {notification && (
        <div
          style={{
            backgroundColor: "yellow",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          {notification}
        </div>
      )}
    </div>
  );
};

export default PlayerApp;

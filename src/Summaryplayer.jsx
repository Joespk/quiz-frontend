import React, { useEffect, useState } from "react";
import axios from "axios";

const Summaryplayer = () => {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(
          "https://quiz-server-8i0m2n8j5-joespks-projects.vercel.app/summary",
          {
            headers: {
              Authorization: "Bearer YOUR_SECRET_TOKEN", // Replace with your actual token
            },
          }
        );
        console.log("Fetched summary:", response.data);
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const topScores = summary
    .filter((item) => item.question === "Scores")
    .flatMap((item) => item.correctUsers)
    .sort((a, b) => b.score - a.score) // Sort by score in descending order
    .slice(0, 3); // Take the top 3 scores

  return (
    <div>
      <h1>Summary</h1>
      {summary
        .filter((item) => item.question !== "Scores") // Filter out "Scores" entries
        .map((item, index) => (
          <div key={index}>
            <h2>{item.question}</h2>
            {item.fastestAnswer && (
              <p>
                Fastest answer: {item.fastestAnswer.name} - Time answered:{" "}
                {item.fastestAnswer.timeAnswered}
              </p>
            )}
          </div>
        ))}
      <div>
        <h2>Top 3 Scores</h2>
        <ul>
          {topScores.map((user, idx) => (
            <li key={idx}>
              {user.name}: {user.score} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Summaryplayer;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Summaryplayer = () => {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:4000/summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div>
      <h1>Summary</h1>
      {summary.map((item, index) => (
        <div key={index}>
          <h2>{item.question}</h2>
          <ul>
            {item.correctUsers.map((user, idx) => (
              <li key={idx}>
                {user.name} - {new Date(user.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Summaryplayer;
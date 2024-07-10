import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import Bot9 from './components/Bot9/Bot9';

function App() {

  const [bot, setBot] = useState("bot9"); 

  return (
    <div className="App">
      <div className="cnt">
        <div className="left">
          <div className="apptitle">
            OpenAI<br />
            Assistants
          </div>
          <div className="nav">
            <div className="navTitle">
              Booking and Reservations
              <div className="navEntry">
                Bot9 Hotel Booking
              </div>
            </div>
          </div>
        </div>
        <div className="right">
          {bot == "bot9" ? <Bot9 /> : ""}
        </div>
      </div>
    </div>
  );
}

export default App;

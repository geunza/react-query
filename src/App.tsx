import React from "react";
import List from "./components/List";
import { BrowserRouter as Router, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <List />
      </Router>
    </div>
  );
}

export default App;

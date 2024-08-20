import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddPerson from "./components/AddPerson";
import ValidatePerson from "./components/ValidatePerson";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AddPerson />} />
        <Route path="/validate-person" element={<ValidatePerson />} />
      </Routes>
    </Router>
  );
}

export default App;

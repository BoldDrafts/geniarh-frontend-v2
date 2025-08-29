import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Recruitment from './features/recruitment/pages/Recruitment';
import RecruitmentCandidates from './features/recruitment/pages/RecruitmentCandidates';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Recruitment />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/recruitment/:id/candidates" element={<RecruitmentCandidates />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
import "./App.css";

import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useMatch,
  useNavigate,
} from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

function PhotoSharing() {
  const [advancedFeatures, setAdvancedFeatures] = useState(false);
  const photo = useMatch("/photos/:userId/:photoId");
  const navigate = useNavigate();
  const showAdvancedFeatures = advancedFeatures || Boolean(photo);

  function changeAdvancedFeatures(checked) {
    setAdvancedFeatures(checked);

    if (!checked && photo) {
      const userId = encodeURIComponent(photo.params.userId);
      navigate("/photos/" + userId, { replace: true });
    }
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar
            advancedFeatures={showAdvancedFeatures}
            onAdvancedChange={changeAdvancedFeatures}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Paper component="aside" className="main-grid-item">
            <UserList />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={9}>
          <Paper component="main" className="main-grid-item">
            <Routes>
              <Route path="/users/:userId" element={<UserDetail />} />
              <Route
                path="/photos/:userId/:photoId?"
                element={<UserPhotos advancedFeatures={showAdvancedFeatures} />}
              />
              <Route path="/users" element={<UserList />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <PhotoSharing />
    </Router>
  );
}

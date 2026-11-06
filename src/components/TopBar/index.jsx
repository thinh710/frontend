import React, { useEffect, useState } from "react";
import {
  AppBar,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMatch } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function TopBar({ advancedFeatures, onAdvancedChange }) {
  const profile = useMatch("/users/:userId");
  const photos = useMatch("/photos/:userId/:photoId?");
  const userId = profile?.params.userId ?? photos?.params.userId;
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const controller = new AbortController();

    async function fetchUser() {
      try {
        const result = await fetchModel(
          "/user/" + encodeURIComponent(userId),
          controller.signal
        );

        if (!controller.signal.aborted) {
          setUser(result);
        }
      } catch {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [userId]);

  const name = user && user._id === userId
    ? user.first_name + " " + user.last_name
    : "";
  let context = "Photo Sharing";

  if (name) {
    context = photos ? "Photos of " + name : name;
  }

  return (
    <AppBar className="topbar-appBar" position="static">
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap", columnGap: 2 }}>
        <Typography variant="h6" component="span">
          Nguyễn Đức Thịnh
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={advancedFeatures}
              onChange={(event) => onAdvancedChange(event.target.checked)}
              sx={{ color: "inherit", "&.Mui-checked": { color: "inherit" } }}
            />
          }
          label="Enable Advanced Features"
          sx={{ m: 0 }}
        />
        <Typography variant="subtitle1" component="span" align="right">
          {context}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;

import React, { useEffect, useState } from "react";
import {
  Alert,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      try {
        const result = await fetchModel("/user/list", controller.signal);

        if (!controller.signal.aborted) {
          setUsers(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, []);

  return (
    <>
      <Typography component="h2" variant="h6" gutterBottom>
        Người dùng
      </Typography>

      {loading && <Typography role="status">Đang tải danh sách…</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && users.length === 0 && (
        <Typography>Chưa có người dùng.</Typography>
      )}

      {users.length > 0 && (
        <List component="nav" aria-label="Danh sách người dùng" disablePadding>
          {users.map((user) => (
            <ListItemButton
              key={user._id}
              component={NavLink}
              to={"/users/" + encodeURIComponent(user._id)}
              sx={{ borderRadius: 1, "&.active": { bgcolor: "action.selected" } }}
            >
              <ListItemText primary={user.first_name + " " + user.last_name} />
            </ListItemButton>
          ))}
        </List>
      )}
    </>
  );
}

export default UserList;

import React, { useEffect, useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);

    async function fetchUser() {
      try {
        const result = await fetchModel(
          "/user/" + encodeURIComponent(userId),
          controller.signal
        );

        if (!controller.signal.aborted) {
          setUser(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError({ userId, message: error.message });
        }
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [userId]);

  if (error?.userId === userId) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (user?._id !== userId) {
    return <Typography role="status">Đang tải hồ sơ…</Typography>;
  }

  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography component="h1" variant="h5">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography><strong>Địa điểm:</strong> {user.location}</Typography>
      <Typography><strong>Nghề nghiệp:</strong> {user.occupation}</Typography>
      <Typography>{user.description}</Typography>
      <Button component={Link} to={"/photos/" + encodeURIComponent(user._id)} variant="contained">
        Xem ảnh
      </Button>
    </Stack>
  );
}

export default UserDetail;

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import {
  Link as RouterLink,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "medium",
});

function formatDateTime(value) {
  const normalized = value.replace(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):/,
    (_, date, hour) => date + "T" + hour.padStart(2, "0") + ":"
  );
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? "Không rõ thời gian" : dateTimeFormat.format(date);
}

function photoSource(fileName) {
  try {
    return require("../../images/" + fileName);
  } catch {
    return null;
  }
}

function UserPhotos({ advancedFeatures }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const [photoData, setPhotoData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);

    async function fetchPhotos() {
      try {
        const photos = await fetchModel(
          "/photosOfUser/" + encodeURIComponent(userId),
          controller.signal
        );

        if (!controller.signal.aborted) {
          setPhotoData({ userId, photos });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError({ userId, message: error.message });
        }
      }
    }

    fetchPhotos();
    return () => controller.abort();
  }, [userId]);

  if (error?.userId === userId) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (photoData?.userId !== userId) {
    return <Typography role="status">Đang tải ảnh…</Typography>;
  }

  const { photos } = photoData;
  const photosPath = "/photos/" + encodeURIComponent(userId);
  const selectedIndex = photoId
    ? photos.findIndex((photo) => photo._id === photoId)
    : 0;

  function photoPath(index) {
    return photosPath + "/" + encodeURIComponent(photos[index]._id);
  }

  if (photoId && selectedIndex === -1) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">Không tìm thấy ảnh này của người dùng.</Alert>
        <Link component={RouterLink} to={photosPath}>Quay về trang ảnh</Link>
      </Stack>
    );
  }

  const showStepper = advancedFeatures && photos.length > 0;

  if (showStepper && !photoId) {
    return <Navigate to={photoPath(0)} replace />;
  }

  const visiblePhotos = showStepper ? [photos[selectedIndex]] : photos;

  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h5">
        Ảnh của người dùng
      </Typography>
      <Link component={RouterLink} to={"/users/" + encodeURIComponent(userId)}>
        Quay về hồ sơ
      </Link>

      {photos.length === 0 && <Typography>Người dùng này chưa có ảnh.</Typography>}

      {showStepper && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            disabled={selectedIndex === 0}
            onClick={() => navigate(photoPath(selectedIndex - 1))}
          >
            Ảnh trước
          </Button>
          <Typography role="status">Ảnh {selectedIndex + 1} / {photos.length}</Typography>
          <Button
            variant="outlined"
            disabled={selectedIndex === photos.length - 1}
            onClick={() => navigate(photoPath(selectedIndex + 1))}
          >
            Ảnh sau
          </Button>
        </Stack>
      )}

      {visiblePhotos.map((photo, index) => {
        const comments = photo.comments ?? [];
        const source = photoSource(photo.file_name);
        const photoNumber = (showStepper ? selectedIndex : index) + 1;

        return (
          <Card key={photo._id} component="article" variant="outlined">
            {source ? (
              <CardMedia
                component="img"
                src={source}
                alt={"Ảnh " + photoNumber + " của người dùng"}
                sx={{ maxHeight: 420, objectFit: "contain", bgcolor: "grey.100" }}
              />
            ) : (
              <Typography sx={{ p: 2 }}>Ảnh không khả dụng.</Typography>
            )}

            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Ngày đăng: {formatDateTime(photo.date_time)}
              </Typography>

              <Typography component="h2" variant="subtitle1" sx={{ mt: 2 }}>
                Bình luận
              </Typography>
              {comments.length === 0 && (
                <Typography variant="body2">Chưa có bình luận.</Typography>
              )}

              <Stack spacing={1.5} divider={<Divider />} sx={{ mt: 1 }}>
                {comments.map((comment) => (
                  <div key={comment._id}>
                    <Link
                      component={RouterLink}
                      to={"/users/" + encodeURIComponent(comment.user._id)}
                    >
                      {comment.user.first_name} {comment.user.last_name}
                    </Link>
                    <Typography variant="caption" component="div" color="text.secondary">
                      {formatDateTime(comment.date_time)}
                    </Typography>
                    <Typography>{comment.comment}</Typography>
                  </div>
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}

export default UserPhotos;

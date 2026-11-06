# Photo Sharing Frontend

Chạy lệnh `npm start`. Giao diện React giữ các màn hình của Lab 1 và chế độ xem từng ảnh.

## Trên StackBlitz

1. Import các file trong thư mục frontend vào một project Node.js.
2. Mở project backend riêng trong cùng trình duyệt, chạy `npm start` và giữ tab editor mở.
3. Sao chép địa chỉ Preview của backend, chỉ lấy phần tên miền và giao thức.
4. Trong Preview của frontend, mở `/users?api=URL_PREVIEW_BACKEND`.

Frontend nhớ URL API trong phiên hiện tại. Nếu URL Preview của backend thay đổi, mở lại đường dẫn ở bước 4 với URL mới.

## Trên máy

Chạy backend cổng 3001 và frontend cổng 3000. Frontend tự kết nối `http://127.0.0.1:3001`. Có thể đặt `REACT_APP_API_URL` nếu backend dùng địa chỉ khác.

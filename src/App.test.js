import { fireEvent, render, screen, within } from "@testing-library/react";

import App from "./App";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  window.history.replaceState(null, "", "/");
});

test("opens a profile, its photos and the advanced photo viewer", async () => {
  const user = {
    _id: "ian",
    first_name: "Ian",
    last_name: "Malcolm",
    location: "Austin, TX",
    occupation: "Mathematician",
    description: "Profile",
  };
  const photos = [
    { _id: "p1", file_name: "malcolm1.jpg", date_time: "2009-09-13 20:00:00" },
    { _id: "p2", file_name: "malcolm2.jpg", date_time: "2009-09-13 20:05:03" },
  ];
  const userUrl = "/user/" + user._id;
  const photosUrl = "/photosOfUser/" + user._id;
  const data = {
    "/user/list": [user],
    [userUrl]: user,
    [photosUrl]: photos,
  };

  window.history.replaceState(null, "", "/users");
  global.fetch = jest.fn(async (url) => {
    const pathname = new URL(url).pathname;
    const found = Object.prototype.hasOwnProperty.call(data, pathname);
    return {
      ok: found,
      status: found ? 200 : 404,
      headers: { get: () => "application/json" },
      json: async () => data[pathname],
    };
  });

  render(<App />);

  const main = within(screen.getByRole("main"));
  const profileLink = await main.findByRole("link", { name: "Ian Malcolm" });
  fireEvent.click(profileLink);

  expect(
    await screen.findByRole("heading", { name: "Ian Malcolm" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Xem ảnh" }));

  expect(await screen.findAllByRole("img")).toHaveLength(photos.length);
  expect(await screen.findByText("Photos of Ian Malcolm")).toBeInTheDocument();
  expect(global.fetch.mock.calls.map(([url]) => new URL(url).pathname)).toEqual(
    expect.arrayContaining(["/user/list", userUrl, photosUrl])
  );

  const advancedToggle = screen.getByRole("checkbox", {
    name: "Enable Advanced Features",
  });
  expect(advancedToggle).not.toBeChecked();
  fireEvent.click(advancedToggle);

  expect(await main.findByText("Ảnh 1 / " + photos.length)).toBeInTheDocument();
  expect(main.getAllByRole("img")).toHaveLength(1);
  expect(main.getByRole("button", { name: "Ảnh trước" })).toBeDisabled();
  expect(window.location.pathname).toBe(
    "/photos/" + user._id + "/" + photos[0]._id
  );

  fireEvent.click(advancedToggle);
  expect(await main.findAllByRole("img")).toHaveLength(photos.length);
  expect(window.location.pathname).toBe("/photos/" + user._id);
});

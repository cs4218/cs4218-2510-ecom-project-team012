// General setup generated with the help of AI

let server;
let app;
let closeTestDB;

export const startTestServer = async (port = 6061) => {
  const module = await import("../../server.js");
  app = module.app || module.default;

  return new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Test backend running on port ${port}`);
      resolve(server);
    });
  });
};

export const stopTestServer = async () => {
  // close the express server first
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log("Test backend stopped");
  }

  // ensure in-memory MongoDB / mongoose connections are closed
  if (!closeTestDB) {
    const module = await import("../../tests/setupTestDB.js");
    closeTestDB = module.closeTestDB;
  }
};

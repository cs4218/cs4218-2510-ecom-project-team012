// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { startTestServer, stopTestServer } from "./setupBackendServer";
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder });

import axios from "axios";
axios.defaults.baseURL = "http://localhost:6061"; // backend test server

beforeAll(async () => {
  // start the backend before tests
  await startTestServer(6061);
}, 15000);

afterAll(async () => {
  // stop the backend after all tests finish
  await stopTestServer();
}, 15000);

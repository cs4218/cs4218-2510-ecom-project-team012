// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { startTestServer, stopTestServer } from "./setupBackendServer";
import { TextEncoder, TextDecoder } from "util";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

Object.assign(global, { TextDecoder, TextEncoder });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import axios from "axios";
axios.defaults.baseURL = "http://localhost:6061"; // backend test server

beforeAll(async () => {
  // start the backend before tests
  await startTestServer(6061);
});

afterAll(async () => {
  // stop the backend after all tests finish
  // jest.setTimeout(10000); // increase timeout
  // try {
  await stopTestServer();
  // } catch (err) {
  //   console.warn("Server already closed");
  // }
});

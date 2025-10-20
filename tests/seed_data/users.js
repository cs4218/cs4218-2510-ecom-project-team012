import mongoose from "mongoose";

export const USERS = [
{
  _id: new mongoose.Types.ObjectId("671218f37e0f5f9fddeb66e9"),
  name: "Daniel",
  email: "Daniel@gmail.com",
  password: "$2b$10$mjJb91uL34wQunwl3q.S7ueLUWwcjT90tX8IhDXk2Go1RfqEyDQdm",
  phone: "Daniel",
  address: "60 Daniel Road",
  answer: "Singapore",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 1,
  createdAt: new Date("2024-10-18T08:14:43.300Z"),
  updatedAt: new Date("2024-10-18T08:14:43.300Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("67136d5416c8949aec627dd3"),
  name: "Test 3",
  email: "hello@test.com",
  password: "$2b$10$slCLTwjFVi7j0a5zmvWRseIxZNL6.el2/4WMhAV8yrO7p6ENMnol2",
  phone: "123",
  address: "hell3@test.com",
  answer: "hello@test.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2024-10-19T08:27:00.468Z"),
  updatedAt: new Date("2024-10-20T09:09:55.668Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("6714c2a30e8ea8335e4104ff"),
  name: "test@test123.com",
  email: "test@test123.com",
  password: "$2b$10$hcWrgH9pOqr1Nc5tMRxpHO5Of22vTZOM/Y/DdiNQ1PqO1e1mbThW.",
  phone: "test@test123.com",
  address: "test@test123.com",
  answer: "test@test123.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2024-10-20T08:43:15.745Z"),
  updatedAt: new Date("2024-10-20T08:43:15.745Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("6714f0fd9202daf875f017ef"),
  name: "Test",
  email: "test@admin.com",
  password: "$2b$10$nyzaFOPhn/01AbiQtp6qEeyLY81ppGWL6oiB3WwwD2JZIuTU3OxKa",
  phone: "test@admin.com",
  address: "test@admin.com",
  answer: "test@admin.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 1,
  createdAt: new Date("2024-10-20T12:01:01.455Z"),
  updatedAt: new Date("2024-10-20T12:01:01.455Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("671b875e17aee62d2300d203"),
  name: "asdf",
  email: "asdf@gmail.com",
  password: "$2b$10$n4XsfcWzT0PPgBG7bGA5rO70ZZ8273ank/530ZJhEBpCA5JKFpV6W",
  phone: "12341234",
  address: "asdf",
  answer: "asdf",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2024-10-25T11:56:14.756Z"),
  updatedAt: new Date("2024-10-25T11:56:14.756Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("671bc2f1364eadc7d5417c80"),
  name: "admin@test.sg",
  email: "admin@test.sg",
  password: "$2b$10$o.ESH/gKZf5ObWT30ptltuVzkaex.AjfQO.ZWz0a7jAll29q7ieuC",
  phone: "admin@test.sg",
  address: "admin@test.sg",
  answer: "admin@test.sg",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 1,
  createdAt: new Date("2024-10-25T16:10:25.288Z"),
  updatedAt: new Date("2024-10-25T16:10:25.288Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("671cf647ef5cf60493cce8f5"),
  name: "MyAdmin",
  email: "admin@admin.com",
  password: "$2b$10$MHZ1uww8rMqg6FC23T3G..EBnhdciGene0VXQkw2b45chAUXVGg3W",
  phone: "81234567",
  address: "admin's address",
  answer: "Leetcoding",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 1,
  createdAt: new Date("2024-10-26T14:01:43.905Z"),
  updatedAt: new Date("2024-10-26T14:01:43.905Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("671de121458e878f02ca07b8"),
  name: "user@test.comuser@test.com",
  email: "usertest.comuser@test.com",
  password: "$2b$10$Pc15GsuumjRLu2lBR0IV3eWj2EqaxJuSGItGsU5ZkEmUjgJLxf3S6",
  phone: "user@test.comuser@test.com",
  address: "user@test.comuser@test.com",
  answer: "user@test.comuser@test.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2024-10-27T06:43:45.619Z"),
  updatedAt: new Date("2024-10-27T06:43:45.619Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("672e27a43a31a117795ce0f9"),
  name: "test@gmail.com",
  email: "test@gmail.com",
  password: "$2b$10$dez1pum4cub4/maDhwRh.uyv/hRTfGNzK40dRQosj07bhdFd.fnZu",
  phone: "test@gmail.com",
  address: "test@gmail.com",
  answer: "test@gmail.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2024-11-08T15:00:52.049Z"),
  updatedAt: new Date("2024-11-08T15:00:52.049Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("672f05f78e4ca7dabcdabae7"),
  name: "user@test.com",
  email: "user@test.com",
  password: "$2b$10$Sgt1q9.yyhvzOZRU5UOx3uMgRf/fUFnqxp0Oyaxqku9rWNMQ57ev6",
  phone: "user@test.com",
  address: "user@test.com",
  answer: "user@test.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2024-11-09T06:49:27.973Z"),
  updatedAt: new Date("2024-11-09T06:49:27.973Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("67a218decf4efddf1e5358ac"),
  name: "CS 4218 Test Account",
  email: "cs4218@test.com",
  password: "$2b$10$//wWsN./fEX1WiipH57HG.SAwgkYv1MRrPSkpXM38Dy5seOEhCoUy",
  phone: "81234567",
  address: "1 Computing Drive",
  answer: "password is cs4218@test.com",
  dob: new Date("2000-01-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2025-02-04T13:40:46.071Z"),
  updatedAt: new Date("2025-02-04T13:40:46.071Z"),
  __v: 0
},

{
  _id: new mongoose.Types.ObjectId("68f64423cfc8b91a9d405b54"),
  name: "Bob",
  email: "bob@bob.com",
  password: "$2b$10$Zp8iGKxEAnsnLiwQsOP.w.tGUHHP2horHBo.3cJr4bHXgIrOIlWoq",
  phone: "12341234",
  address: "2 Street",
  answer: "Tennis",
  dob: new Date("2003-02-01T00:00:00.000Z"),
  role: 0,
  createdAt: new Date("2025-10-20T14:16:03.866Z"),
  updatedAt: new Date("2025-10-20T15:28:09.671Z"),
  __v: 0
}
];

export default USERS;

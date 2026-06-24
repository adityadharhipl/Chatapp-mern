// import socketManager from "./socket.manager.js";

// const socketHandler = (io) => {

//   io.on("connection", (socket) => {

//     console.log("Socket Connected:", socket.id);

//     socket.on("register", (userId) => {

//       socketManager.addUser(
//         userId,
//         socket.id
//       );

//       console.log(
//         "User Registered:",
//         userId
//       );
//     });

//     socket.on("disconnect", () => {

//       socketManager.removeUser(
//         socket.id
//       );

//       console.log(
//         "Socket Disconnected:",
//         socket.id
//       );
//     });

//   });

// };

// export default socketHandler;


// // import socketManager
// // from "./socket.manager.js";

// // export default (io)=>{

// //  io.on(
// //   "connection",
// //   (socket)=>{

// //    console.log(
// //     "Connected",
// //     socket.id
// //    );

// //    socket.on(
// //     "register",
// //     (userId)=>{

// //      socketManager.addUser(
// //       userId,
// //       socket.id
// //      );

// //     }
// //    );

// //    socket.on(
// //     "disconnect",
// //     ()=>{

// //      socketManager.removeUser(
// //       socket.id
// //      );

// //     }
// //    );

// //   }
// //  );

// // };


import socketManager from "./socket.manager.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("register", (userId) => {
      socketManager.addUser(userId, socket.id);
    });

    socket.on("disconnect", () => {
      socketManager.removeUser(socket.id);
    });
  });
};

export default socketHandler;
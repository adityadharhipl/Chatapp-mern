// class SocketManager {

//  constructor(){
//    this.users = new Map();
//  }

//  addUser(
//   userId,
//   socketId
//  ){
//   this.users.set(
//    userId,
//    socketId
//   );
//  }

//  removeUser(
//   socketId
//  ){

//   for(
//    const [id,socket]
//    of this.users
//   ){

//    if(socket===socketId){
//     this.users.delete(id);
//    }

//   }

//  }

//  getSocket(userId){
//   return this.users.get(
//    userId
//   );
//  }

// }

// export default new SocketManager();

class SocketManager {
  constructor() {
    this.users = new Map();
  }

  addUser(userId, socketId) {
    this.users.set(userId, socketId);
  }

  removeUser(socketId) {
    for (const [userId, id] of this.users) {
      if (id === socketId) {
        this.users.delete(userId);
      }
    }
  }

  getSocket(userId) {
    return this.users.get(userId);
  }
}

export default new SocketManager();
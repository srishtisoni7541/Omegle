const express=require('express');
const app=express();
const path=require('path');
const IndexRouter=require('./routes/index');
const http=require('http');
const server=http.createServer(app);
const socketIo=require('socket.io');
const io=socketIo(server);
const { v4: uuidv4 } = require('uuid');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use('/',IndexRouter);
const waitingusers=[];

io.on('connection',function(socket){
    socket.on('userconnect',function(){
       let roomname = uuidv4();
    //    console.log(roomname)
       if(waitingusers.length>0){
        socket.join(roomname);
        waitingusers[0].join(roomname);
        waitingusers.pop();
        io.to(roomname).emit("joined", roomname);
       }
       else{
        waitingusers.push(socket);
    }
    })

    socket.on('message',function(data){
        socket.broadcast.to(data.room).emit('message',data.message)
        
    })

  
    socket.on("signalingMessage", function (data) {
      socket.broadcast.to(data.room).emit("signalingMessage", data.message);
    });
  


    socket.on("startVideoCall", function ({ room }) {
        socket.broadcast.to(room).emit("incomingCall");
      });
    
      socket.on("rejectCall", function ({ room }) {
        socket.broadcast.to(room).emit("callRejected");
      });
    
      socket.on("acceptCall", function ({ room }) {
        socket.broadcast.to(room).emit("callAccepted");
      });

      
  

})
server.listen(process.env.PORT||3000);


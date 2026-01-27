import app from './app';
import { config } from './config/env';
import { AppDataSource } from './config/db';
AppDataSource.initialize()
.then(()=>{
    console.log("Database connected")
    app.listen(config.port,()=>{
      console.log(`Server running on port ${config.port}`)
    })
})
.catch((err)=>{
  console.error("Database connection failed: ",err)
  process.exit(1)
})
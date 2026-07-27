import { spawn } from 'node:child_process';
const run = (command,args) => spawn(command,args,{stdio:'inherit',shell:process.platform==='win32'});
const api=run(process.execPath,['src/server/server.mjs']);
const vite=run('vite',[]);
const stop=()=>{api.kill();vite.kill();};
process.on('SIGINT',stop); process.on('SIGTERM',stop);
Promise.race([new Promise(r=>api.on('exit',r)),new Promise(r=>vite.on('exit',r))]).then(code=>{stop();process.exit(code||0);});
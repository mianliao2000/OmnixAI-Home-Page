import fs from 'node:fs';
const value=JSON.parse(fs.readFileSync(new URL('../contracts/platform-v1.json',import.meta.url)));
if(value.version!==1)throw new Error('Unsupported platform contract');
for(const origin of Object.values(value.origins)){const url=new URL(origin);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/')throw new Error('Invalid production origin');}
const source=fs.readFileSync(new URL('../src/platform.ts',import.meta.url),'utf8');
for(const origin of Object.values(value.origins))if(!source.includes(origin))throw new Error(`Missing origin: ${origin}`);
console.log('Platform contract v1 checked');

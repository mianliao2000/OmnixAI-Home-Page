import { defineConfig } from 'playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://127.0.0.1:5174',channel:process.env.CI?undefined:'chrome'},webServer:{command:'npm run dev',url:'http://127.0.0.1:5174',reuseExistingServer:!process.env.CI},projects:[{name:'desktop',use:{viewport:{width:1920,height:1080}}},{name:'mobile',use:{viewport:{width:390,height:844}}}]});

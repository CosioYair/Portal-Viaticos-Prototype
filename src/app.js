// APP ENTRY — loads the mock data (src/data/*.json) and mounts the Portal shell into #app.
// Angular: main.ts + AppComponent; the JSON files become mock services / fixtures.
import { DATA_FILES } from './config/app-config.js';
import { mountPortal } from './layout/portal-layout.js';

const data = {};
await Promise.all(DATA_FILES.map(async name => { data[name] = await (await fetch(`src/data/${name}.json`)).json(); }));
mountPortal(document.getElementById('app'), data);

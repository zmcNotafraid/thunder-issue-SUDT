## An Open Source Issue CKB SUDT GUI

Speed up issue [SUDT](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0025-simple-udt/0025-simple-udt.md) like thunder ⚡️

### Requirements
- Vue 3.0
- Node.js 12
- Yarn
- [Keypering](https://github.com/nervosnetwork/keypering)

### Getting started

1. Run Keypering

2. Install dependencies

    ```$ yarn install```

3. Copy ```.env.example``` file to ```.env.local```, modify SUDT and ACP Script. (Default is CKB testnet script)

4. Run App

    ```$ yarn serve```

5. Visit ```http://localshot:8080```

### RoadMap
 - [x] Keypering Auth
 - [x] Issue SUDT
 - [x] Transfer SUDT
 - [x] Burn SUDT
 - [x] Submit Token Info
 - [ ] Test Coverage
 - [ ] [pw-core](https://github.com/lay2dev/pw-core) Auth

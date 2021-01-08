# ThunderIssueSUDT

> You need to configure your devnet info in src/utils/const first.

An open source GUI for easy issue [SUDT](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0025-simple-udt/0025-simple-udt.md)

Feature List:
- Issue SUDT and [SUDT info](https://talk.nervos.org/t/a-sudt-information-storage-meta-cell-design-proposal/5011) at same time
- Transfer SUDT to normal Cell or ACP cell
- Burn SUDT
- Issue SUDT info only and display SUDT info

## Requirements
- Vue 3.0
- Node.js
- Yarn
- [Keypering](https://github.com/nervosnetwork/keypering)

## Getting started

1. Run Keypering

2. Install dependencies

    ```bash
    yarn install
    ```

4. Run App

    ```bash
    yarn serve
    ```

5. Visit ```http://localshot:8080```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)

# Personal WhatsApp Bot

Hello there, welcome to my personal whatsapp bot project. I use the [Baileys Multi-Device](https://github.com/adiwajshing/baileys) module where it uses websocket.

## Features

**Converter:**

-   Sticker To Image

    > Convert your whatsapp sticker to image, so you could download it.

-   Image To Sticker
    > Comvert your JPG/JPEG/PNG image to whatsapp sticker.

**Downloader:**

-   YouTube Video Download To MP3/MP4

    > Download youtube video to MP3/MP4 format from an URL or just a keyword.

-   TikTok Video Downloader
    > Download a tiktok video from a TikTok Video URL.

## Installation & Configuration

-   You need to install NodeJS Latest Version (>=16.x)
-   Clone this repository.
-   Install dependencies using `yarn` or `npm` (`yarn/npm install`)
-   Change `.env.schema` to `.env`, and fill `REDIS` with your redis server url.
-   Generate your credentials using `node scripts/genKey.mjs`
-   Finally, run `npm run build` or `yarn build` and `node ./dist/index.js`

## Authentication

WhatsApp using QR to authenticate an account, in this project. QR is available on `qr.png` (generated)
QR is generated when the client isn't authenticated and, `qr.png` will removed when websocket is closed.

Your authenticated data will saved in `auth.json` file.

## Contribution

You are welcome to contribute this project if you want.

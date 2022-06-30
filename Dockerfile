FROM node:17.9.1-alpine3.15

RUN apk update

RUN mkdir -p /home/bot-wa
COPY . /home/bot-wa
WORKDIR /home/bot-wa

RUN yarn install
RUN yarn build

CMD ["node", "dist/index.js"]
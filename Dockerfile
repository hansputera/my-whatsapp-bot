FROM node:17.9.1-alpine3.15

RUN apk update

RUN mkdir -p /home/bot-wa
COPY . /home/bot-wa
WORKDIR /home/bot-wa

# make sure config.ts if exists
RUN [ -e "src/config.ts" ] && echo "src/config.ts exists!" || cp src/config.example.ts src/config.ts

RUN yarn install
RUN yarn build

CMD ["node", "dist/index.js"]
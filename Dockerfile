FROM node:13

ENV HOME /root
WORKDIR /root

COPY server .


EXPOSE 80

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
RUN npm install mongodb
RUN npm install bcrypt

CMD /wait && node server.js
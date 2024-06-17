FROM node:20  
WORKDIR /app  
COPY package*.json ./  
RUN npm i  
COPY . .  
RUN npm run build  
EXPOSE 3002
CMD ["npm", "start"]
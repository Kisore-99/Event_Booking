const express= require('express');
const bodyParser= require('body-parser');
const graphqlHTTP= require('express-graphql');
const mongoose= require('mongoose');
const app= express();

const graphQlSchema= require('./graphql/schema/index');
const graphQlResolvers= require('./graphql/resolvers/index');

const isAuth = require('./middleware/is-auth');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { //OPTIONS is default method of browser 
      return res.sendStatus(200);
    }
    next();
  });
  
  app.use(isAuth);

//graphqlHTTP-> middleware function
app.use('/graphql', graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}))

const PORT= process.env.PORT || 5000;
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-v0sok.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(()=>{
    app.listen(PORT, ()=> console.log(`Server is running at ${PORT}`))
})
.catch(err=>{
    console.log(err);
});



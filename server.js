const express= require('express');
const bodyParser= require('body-parser');
const graphqlHTTP= require('express-graphql');
const {buildSchema}= require('graphql');
const mongoose= require('mongoose');
const bcrypt= require('bcryptjs');

const app= express();
const Event= require('./models/event');
const User= require('./models/user');


app.use(bodyParser.json());

//graphqlHTTP-> middleware function
app.use('/graphql', graphqlHTTP({
    schema:buildSchema (`

        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput{
            email: String!
            password: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events:()=>{
            return Event.find()
            .then(events =>{
                return events.map(event=>{
                    return {...event._doc, _id: event._doc._id.toString()}; //overwriting the type of id from ObjectId(in mongodb) to stringthat could be understood by graphql
                    //return {...event._doc, _id: event.id}; it is an alternative of above line
                })
            })
            .catch(err =>{
                throw err;
            })
        },
        createEvent: (args)=>{
            const event= new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, //+ indicates float value
                date: new Date(args.eventInput.date),
                creator: '5dededd43c77f813f8d616f5' //mongoose automatically convert this into objectId
            });
            let createdEvent;
            return event
            .save()
            .then(result=>{
                createdEvent= { ...result._doc, _id: result._doc._id.toString() };
                return User.findById('5dededd43c77f813f8d616f5')
            })
            .then(user=>{
                if(!user){
                    throw new Error('User not found');
                }
                user.createdEvents.push(event); //passing the event object  
                return user.save(); //updating the user
            })
            .then(result =>{
                return createdEvent;
            })
            .catch(err=>{
                console.log(err);
                throw err; //if error occurs graphql and express graphql can return error
            });
            
        },
        createUser :(args)=>{
            return User.findOne({
                email: args.userInput.email
            })
            .then(user=>{
                if(user){
                    throw new Error('User exists already')
                }
            return bcrypt
            .hash(args.userInput.password, 12)
            })
            .then(hashedPassword=>{
                const user= new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result =>{
                return { ...result._doc, password: null, _id: result.id } //to not return password, it is set to null
            })
            .catch(err =>{
                throw err;
            })
            
        }   
    },
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



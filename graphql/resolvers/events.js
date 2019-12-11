const Event= require('../../models/event');
const User = require('../../models/user');


const { transformEvent }= require('./merge');

module.exports= {
    events: async ()=>{
        try{
        const events= await Event.find();
        //.populate('creator') //populate is to look at the ref of specified field in the collection and makes the relation with that collection
            return events.map(event=>{
                return transformEvent(event);
                // return {...event._doc,
                //      _id: event._doc._id.toString(),
                //      date: new Date(event._doc.date).toISOString(),
                //     creator: user.bind(this, event._doc.creator)
                //     //     ...event._doc.creator._doc,
                //     //     id: event._doc.creator.id
                    
                // }; //overwriting the type of id from ObjectId(in mongodb) to stringthat could be understood by graphql
                //return {...event._doc, _id: event.id}; it is an alternative of above line
        
        })
    } catch(err){
        throw err;
    }
     
},
    createEvent: async (args, req)=>{
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
          }
        const event= new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price, //+ indicates float value
            date: new Date(args.eventInput.date),
            creator: req.userId //mongoose automatically convert this into objectId
        });
        let createdEvent;
        try{
        const result= await event.save()
            createdEvent= transformEvent(result);
            const creator= await User.findById(req.userId);
            if(!creator){
                throw new Error('User not found');
            }
            creator.createdEvents.push(event); //passing the event object  
            await creator.save(); //updating the user
            return createdEvent;
        }

        catch(err){
            console.log(err);
            throw err; //if error occurs graphql and express graphql can return error
        }
        
    },

}

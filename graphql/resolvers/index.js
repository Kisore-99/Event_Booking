const bcrypt= require('bcryptjs');
const Event= require('../../models/event');
const User= require('../../models/user');

const events= async eventIds=>{
    try{
    const events= await Event.find({_id : {$in: eventIds}})
        events.map(event=>{
            return{
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)// it indicates creator is not s single value, it calls a function when it is invoked
            }
        
    });
    return events;
}  catch(err){
    throw err;
}
}


const user= userId =>{
    return User.findById(userId)
    .then(user =>{
        return { ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }
    })
    .catch(err =>{
        throw err;
    })
} 



module.exports= {
    events: async ()=>{
        try{
        const events= await Event.find()
        //.populate('creator') //populate is to look at the ref of specified field in the collection and makes the relation with that collection
            return events.map(event=>{
                return {...event._doc,
                     _id: event._doc._id.toString(),
                     date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                    //     ...event._doc.creator._doc,
                    //     id: event._doc.creator.id
                    
                }; //overwriting the type of id from ObjectId(in mongodb) to stringthat could be understood by graphql
                //return {...event._doc, _id: event.id}; it is an alternative of above line
        
        })
    } catch(err){
        throw err;
    }
     
},
    createEvent: async (args)=>{
        const event= new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price, //+ indicates float value
            date: new Date(args.eventInput.date),
            creator: '5dee1f0484952c14c4a2d0c5' //mongoose automatically convert this into objectId
        });
        let createdEvent;
        try{
        const result= await event
        .save()
            createdEvent= { 
                ...result._doc, 
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator) };
            const creator= await User.findById('5dee1f0484952c14c4a2d0c5');
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
    createUser :async (args)=>{
        try{
        const existingUser= await User.findOne({
            email: args.userInput.email
        })
            if(existingUser){
                throw new Error('User exists already')
            }
        const hashedPassword= await bcrypt
        .hash(args.userInput.password, 12)
            const user= new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            const result= await user.save();

            return { ...result._doc, password: null, _id: result.id } //to not return password, it is set to null
        }

        catch(err){
            throw err;
        }
        
    }   
}
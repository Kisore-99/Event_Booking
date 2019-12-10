const Event= require('../../models/event');
const User= require('../../models/user');
const { dateToString }=require('../../helpers/data');
const events= async eventIds=>{
    try{
    const events= await Event.find({_id : {$in: eventIds}})
     return events.map(event=>{
            return transformEvent(event);
    });
    
  }catch(err){
        throw err;
    }
}

const singleEvent= async eventId =>{
    try{
        const event= await Event.findById(eventId);
        return transformEvent(event);

    }catch(err){
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

const transformEvent= event =>{
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)// it indicates creator is not s single value, it calls a function when it is invoked
    }
}

const transformBooking= booking =>{
    return {
        ...booking._doc,
        _id: booking.id , 
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt) 
       }
}

exports.transformEvent= transformEvent;
exports.transformBooking= transformBooking;
//exports.user= user;
// exports.events= events;
//exports.singleEvent= singleEvent;
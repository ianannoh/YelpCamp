const cities = require('./cities')
const seedhelpers = require('./seedhelpers')
const Campground = require('../models/campGround')
// two dots in the path means nodeman should come out and enter models folder for campground.js file
const mongoose = require('mongoose')
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelpCamp',);
    console.log('connected')
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random18 = Math.floor(Math.random() * 18);
        const random21 = Math.floor(Math.random() * 21);
        const priceM = Math.floor(Math.random()*1000);
        const camp = new Campground({
            author: '638005aca5424517dbd25565',
            title: `${seedhelpers.descriptors[random18]} ${seedhelpers.places[random21]}`,
            price: priceM,  
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo maiores ad reprehenderit quibusdam. Quae est, molestias pariatur nobis laboriosam dolore cumque inventore sint ipsa dignissimos architecto, doloremque porro expedita. Impedit.',         
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: [ 
                {
                    url: 'https://img.freepik.com/free-vector/camping-composition-with-two-tents-fire-cool-box-with-trees-night-sky-cartoon_1284-54942.jpg?w=2000',
                    filename: 'typed it'
                },
                {
                    url: 'https://res.cloudinary.com/dvqgao0sn/image/upload/v1669936432/YelpCamp/k1oejal4baq0zfxtdppc.jpg',
                    filename: 'typed this too'
                }
               
            ] 
        })
        await camp.save()
    }
    
}

seedDB().then(()=> {
    mongoose.connection.close()
})
// this closes the connection?
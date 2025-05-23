const mongoose = require('mongoose');

const uri = "mongodb+srv://vivekvardhanvandana:trtNkHCIlPMobxbC@cluster0.pdmj4b3.mongodb.net/myDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected!');

  // Define a simple schema and model
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
  });

  const User = mongoose.model('User', userSchema);

  // Create and save a new user
  const user = new User({ name: 'Vivek', email: 'vivek@example.com' });
  return user.save();
})
.then(() => {
  console.log('User saved successfully!');
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
});

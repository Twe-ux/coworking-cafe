const mongoose = require('mongoose');

async function checkEmployee() {
  try {
    await mongoose.connect('mongodb+srv://dev:***REMOVED***@coworking.jhxdixz.mongodb.net/coworking-admin');
    
    const employee = await mongoose.connection.collection('employees').findOne({
      _id: new mongoose.Types.ObjectId('697508e9e3a14dfe08cf5bcf')
    });
    
    console.log('\n=== EMPLOYEE DATA ===');
    console.log('Name:', employee.firstName, employee.lastName);
    console.log('\n=== ONBOARDING STATUS ===');
    console.log(JSON.stringify(employee.onboardingStatus, null, 2));
    console.log('\n=== OTHER FIELDS ===');
    console.log('clockingCode:', employee.clockingCode);
    console.log('color:', employee.color);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmployee();

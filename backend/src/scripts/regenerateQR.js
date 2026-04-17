const mongoose = require('mongoose');
const QRCode = require('qrcode');
require('dotenv').config({ path: '../../.env' });

async function regenerateQR() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartgym');
    console.log('Connected to MongoDB');
    
    const member = await mongoose.connection.collection('members').findOne({ memberId: 'PERFIT00003' });
    
    if (member) {
      const qrData = JSON.stringify({ 
        memberId: member.memberId, 
        name: member.name, 
        mobile: member.mobileNumber 
      });
      
      const qrCode = await QRCode.toDataURL(qrData);
      
      await mongoose.connection.collection('members').updateOne(
        { _id: member._id },
        { $set: { qrCode: qrCode } }
      );
      
      console.log('✅ QR Code generated for member:', member.name);
      console.log('   Member ID:', member.memberId);
    } else {
      console.log('❌ Member not found with ID: PERFIT00003');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

regenerateQR();
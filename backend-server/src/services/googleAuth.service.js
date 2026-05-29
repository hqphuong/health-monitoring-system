const { OAuth2Client } = require('google-auth-library');
// Duy cần lấy CLIENT_ID từ Google Cloud //console (mình sẽ chỉ cách lấy sau)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    
    // Trả về thông tin user từ Google
    return {
      email: payload.email,
      full_name: payload.name,
      google_id: payload.sub,
      picture: payload.picture
    };
  } catch (error) {
    //console.error('❌ [Google Verify Error]:', error.message);
    throw new Error('Xác thực Google không thành công');
  }
};

module.exports = { verifyGoogleToken };
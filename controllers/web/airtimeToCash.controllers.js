export async function convertAirtimeToCash(req, res){
    const { networkCode, phoneNumber, amount, airtimeSharePin } = req.body

    try {
        if(!networkCode || !phoneNumber || !amount || !airtimeSharePin){
            return res.status(400).json({ success: false, data: 'Please Fill all Input Feilds'})
        }
        const mobileRegex = /^(090|080|070)\d{8}$/;
        
        if (!mobileRegex.test(phoneNumber)) {
            return res.status(400).json({ success: false, data: 'Invalid phone number' });
        }

        //connect api to convert airtime to cash
        //if successfull create a transaction
        //update user wallet balance

    } catch (error) {
        console.log('UNABLE TO BUY AIRTIME', error)
        res.status(500).json({ success: false, data: error.message || 'Unable to convert airtime to cash'})
    }
}
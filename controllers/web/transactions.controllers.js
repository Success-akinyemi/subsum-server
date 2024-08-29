import TransctionHistroyModel from "../../model/TransactionHistroy.js"


//FETCH ALL USER TRANSCATIONS
export async function fetchAllUserTractions(req, res) {
    const { _id } = req.user
    try {
        const getAllTransctions = await TransctionHistroyModel.find({ userId: _id })

        res.status(200).json({ success: true, data: getAllTransctions })
    } catch (error) {
        console.log('UNABLE TO FETCH ALL TRANSACTIONS')
        res.status(500).json({ success: false, data: error.message || 'Unable to get all transactions'})
    }
}

//FETCH A TRANSACTION OF A USER
export async function fetchAUserTraction(req, res) {
    const { _id } = req.user
    const { id } = req.params
    try {
        const getTransction = await TransctionHistroyModel.find({ _id: id })

        if(!getTransction.userId !== _id){
            return res.status(403).json({ success: false, data: 'Not allowed to fetch transaction details' })
        }

    } catch (error) {
        console.log('UNABLE TO FETCH ALL TRANSACTIONS')
        res.status(500).json({ success: false, data: error.message || 'Unable to get all transactions'})
    }
}

//UPDTAE USER TRANSACTIONS
import TokenModel from "../../model/Token.js";
import UserModel from "../../model/User.js";
import crypto from 'crypto'
import sendEmail from "../../middleware/sendEmail.js";


//REGISTER NEW USER

//VERIFY NEW USER

//LOGIN USER
export async function login(req, res){
    const { emailOrMobile, password } = req.body;

    if(!emailOrMobile || !password){
        return res.status(401).json({ success: false, data: 'Please provide an email and password'})
    }

    try {
        const isEmail = emailOrMobile.includes('@');

        let user;

        if(isEmail){
            user = await UserModel.findOne({ email: emailOrMobile }).select('+password')
        } else {
            user = await UserModel.findOne({ mobile: emailOrMobile }).select('+password')
        }

        console.log('USER NUMBER', user)
        
        if(!user){
            return res.status(403).json({ success: false, data: 'Invalid User'})
        }

        const isMatch = await user.matchPasswords(password);

        if(!isMatch){
            return res.status(403).json({ success: false, data: 'Invalid Password'})
        }

        if(!user.verified){
            let token = await TokenModel.findOne({ userId: user._id})
            if(!token){
                const token = await new TokenModel({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString('hex')
                }).save()
        
                const verifyUrl = `${process.env.MAIL_WEBSITE_LINK}/${user._id}/verify/${token.token}`
        
                try {
                    // send mail
                    const emailContent = {
                        body: {
                            intro: 'PLEASE VERIFY EMAIL',
                            action: {
                                instructions: `Your Subsum Account is not yet valid, Please Click on the Button Below to verify your Email Address. Note Email is Valid for One (1) Hour.`,
                                button: {
                                    color: '#33b5e5',
                                    text: 'Verify Your Email',
                                    link: verifyUrl
                                },
                            },
                            outro: `
                                If you cannot click the reset button, copy and paste the url here in your browser ${verifyUrl}
        
                                If you did not SignUp to Subsum, please ignore this email and report.
                            `
                        },
                    };
        
                    const emailTemplate = mailGenerator.generate(emailContent)
                    const emailText = mailGenerator.generatePlaintext(emailContent)
                    
                    await sendEmail({
                        to: user.email,
                        subject: 'Verify Your Email',
                        text: emailTemplate
                    })

        
                    return res.status(200).json({success: true, isVerified: false , data: `Verification Email Sent. Check your email address and verify your account`})
                } catch (error) {
                    console.log('ERROR SENDING VERIFY EMAIL', error)
                    return res.status(500).json({ success: false, data: 'Email could not be sent'})
                }
            } else{
                return res.status(200).json({ success: false, isVerified: false, data: 'Account Not Verified. An Email Has been sent to You Please Verify Account'})
            }
        }


        //sendToken(user, 200, res)
        const token = user.getSignedToken();
        const expiryDate = new Date(Date.now() + 10 * 60 * 60 * 1000)
        const { resetPasswordToken, resetPasswordExpire, password: hashedPassword, ...userData } = user._doc
        //res.status(200).json({ success: true, token: token, isVerified: true, data: {success: true, data: userData }})
        res.cookie('subsumtoken', token, { httpOnly: true, expires: expiryDate, sameSite: 'None', secure: true } ).status(201).json({ success: true, token: token, isVerified: true, data: {success: true, data: userData }})
    } catch (error) {
        console.log('ERROR LOGGING USER', error)
        res.status(500).json({ success: false, data: error.message})
    }
}

//SIGNUP AND LOGIN WITH GOOGLE
export async function google(req, res){
    const { name, email, photo } = req.body
    try {
        const user = await UserModel.findOne({ email: email })
        if(user){
            const token = user.getSignedToken();
            const { resetPasswordToken, resetPasswordExpire, password: hashedPassword, ...userData } = user._doc
            const expiryDate = new Date(Date.now() + 10 * 60 * 60 * 1000)
            res.cookie('accessToken', token, { httpOnly: true, expires: expiryDate, sameSite: 'None', secure: true}).status(201).json({ success: true, data: userData })
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new UserModel({
                username: name,
                email: email,
                password: hashedPassword,
                profilePicture: photo
            })
            await newUser.save()
            const token = user.getSignedToken();
            const { resetPasswordToken, resetPasswordExpire, password: hashedAndSavedPassword, ...userData }= newUser._doc
            const expiryDate = new Date(Date.now() + 10 * 60 * 60 * 1000)
            res.cookie('accessToken', token, { httpOnly: true, expires: expiryDate, sameSite: 'None', secure: true}).status(201).json({ success: true, data: userData })
        }
    } catch (error) {
        console.log('ERROR SINGIN USER WITH GOOGLE', error)
        res.status(500).json({ success: false, data: 'Could not signin user'})
    }
}

//USER FORGOT PASSWORD REQUEST
export async function forgotPassword (req, res, next){
    const { email } = req.body

    if(!email){
        return res.status(404).json({ success: false, data: 'Provide your registered email address'})
    }

    try {
        const user = await UserModel.findOne({ email });

        if(!user){
            return res.status(404).json({ success: false, data: 'Email Does Not Exist'})
        }

        const resetToken = user.getResetPasswordToken()

        await user.save()
        const number = user.whatsappNumber
        const resetUrl = `${process.env.MAIL_WEBSITE_LINK}/reset-password/${resetToken}`
        
        try {
            // send mail
            const emailContent = {
                body: {
                    intro: 'You have Requested a password reset.',
                    action: {
                        instructions: 'Please click the following button to reset your password. Link Expires in 10 mintues',
                        button: {
                            color: '#33b5e5',
                            text: 'Reset Your Password',
                            link: resetUrl
                        },
                    },
                    outro: `
                        If you cannot click the reset button, copy and paste the url here in your browser ${resetUrl}

                        If you did not request this reset, please ignore this email.
                    `
                },
            };

            const emailTemplate = mailGenerator.generate(emailContent)
            const emailText = mailGenerator.generatePlaintext(emailContent)
            
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: emailTemplate
            })
            res.status(200).json({success: true, msg: 'Email sent', data: email })
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save()
            return res.status(500).json({ success: false, data: 'Email could not be sent' })
        }
    } catch (error) {
        console.log('ERROR GENERATING RESET LINK', error)
        res.status(500).json({ success: false, data: error.message})
    }
}

//USER RESET PASSWORD
export async function resetPassword (req, res, next){
    const { password, confirmPassword } = req.body
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

    try {
        if (password.length < 6) {
            return res.status(400).json({ success: false, data: 'Passwords must be at least 6 characters long' });
        }
    
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, data: 'Passwords do not match' });
        }
    
        const specialChars = /[!@#$%^&*()_+{}[\]\\|;:'",.<>?]/;
        if (!specialChars.test(password)) {
            return res.status(400).json({ success: false, data: 'Passwords must contain at least one special character' });
        }

        const user = await UserModel.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now()}
        })

        if(!user){
            return  res.status(400).json({ success: false, data: 'Invalid Reset Token'})
        }

        user.password = password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined

        await user.save();

        res.status(201).json({
            success: true,
            data: 'Password Reset success'
        })
    } catch (error) {
        console.log('ERROR RESETING USER PASSWORD', error)
        res.status(500).json({ success: false, data: error.message})
    }
}

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({success: true, token, isVerified: true})
}

export async function signout(req, res){
    res.clearCookie('subsumtoken').status(200).json({success: true, data: 'Signout success'})
}

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRIG_API)

sgMail.send({
    to: 'abdelkhalek2001100@gmail.com',
    from: 'abdelkhalek2001100@gmail.com',
    subject: 'dfdf',
    from: 'abdelkhalek2001100@gmail.com frist email',


})
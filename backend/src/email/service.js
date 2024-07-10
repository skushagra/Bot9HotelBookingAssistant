import emailjs from '@emailjs/browser';

const sendEmail = (email) => {
    emailjs.sendForm("service_bk5ou9l", "template_slkxpmv", {
        email: email
    }, {
        publicKey: "Q-XfghO2L0gpUWFW-",
    }).then((result) => {
        console.log("SUCCESS"); 
    }).catch((err) => {
        console.log("ERROR");
    });
}
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password"
    }
});

app.post("/send-mail", (req, res) => {
    const { name, email, message } = req.body;
    const mailOptions = {
        from: email,
        to: "Piyush021104@gmail.com",
        subject: `New Contact Request from ${name}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.send("Email sent successfully!");
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));

require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (your HTML, CSS, etc.)
app.use(express.static('.'));

// Contact form endpoint - uses Web3Forms API (API key is hidden on server)
app.post("/send-mail", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Prepare form data for Web3Forms
        const formData = new URLSearchParams();
        formData.append('access_key', process.env.WEB3FORMS_ACCESS_KEY);
        formData.append('subject', 'New Contact Form Message from Portfolio Website');
        formData.append('to', process.env.RECIPIENT_EMAIL);
        formData.append('from_name', name);
        formData.append('from_email', email);
        formData.append('message', message);

        // Send to Web3Forms API
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        const data = await response.json();

        if (response.ok && data.success) {
            res.json({ 
                success: true, 
                message: 'Email sent successfully!' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: data.message || 'Failed to send email' 
            });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again later.' 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

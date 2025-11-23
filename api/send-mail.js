export default async function handler(req, res) {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(200).end();
    }

    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if environment variables are set
        if (!process.env.WEB3FORMS_ACCESS_KEY) {
            console.error("WEB3FORMS_ACCESS_KEY is not set");
            return res.status(500).json({
                success: false,
                message: "Server configuration error: Missing API key"
            });
        }

        if (!process.env.RECIPIENT_EMAIL) {
            console.error("RECIPIENT_EMAIL is not set");
            return res.status(500).json({
                success: false,
                message: "Server configuration error: Missing recipient email"
            });
        }

        // Prepare form data for Web3Forms
        const formData = new URLSearchParams();
        formData.append("access_key", process.env.WEB3FORMS_ACCESS_KEY);
        formData.append("subject", "New Contact Form Message from Portfolio Website");
        formData.append("to", process.env.RECIPIENT_EMAIL);
        formData.append("from_name", name);
        formData.append("from_email", email);
        formData.append("message", message);

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return res.status(200).json({ success: true, message: "Email sent successfully!" });
        } else {
            console.error("Web3Forms API error:", data);
            return res.status(500).json({
                success: false,
                message: data.message || "Failed to send email"
            });
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: error.message
        });
    }
}

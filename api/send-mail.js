export default async function handler(req, res) {
    // Handle CORS preflight
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

    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed",
        });
    }

    try {
        const { name, email, message } = req.body;

        // Validate fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if API key is set in environment variables
        const access_key = process.env.WEB3FORMS_ACCESS_KEY;
        if (!access_key) {
            console.error("Missing WEB3FORMS_ACCESS_KEY in environment variables");
            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        // Prepare form data for Web3Forms (API key is hidden on server)
        const formData = new URLSearchParams();
        formData.append("access_key", access_key);
        formData.append("subject", "New Contact Form Message from Portfolio");
        formData.append("from_name", name);
        formData.append("from_email", email);
        formData.append("message", message);

        // Optional: Set recipient email from environment variable
        if (process.env.RECIPIENT_EMAIL) {
            formData.append("to", process.env.RECIPIENT_EMAIL);
        }

        // Send to Web3Forms API
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return res.status(200).json({
                success: true,
                message: "Email sent successfully!",
            });
        } else {
            console.error("Web3Forms Error:", data);
            return res.status(500).json({
                success: false,
                message: data.message || "Failed to send email",
            });
        }
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
}


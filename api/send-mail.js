export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(200).end();
    }
  
    // CORS headers for all responses
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
      // Parse request body (Vercel automatically parses JSON, but let's be safe)
      let body = req.body;
      
      // If body is a string, parse it
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body",
          });
        }
      }

      const { name, email, message } = body || {};

      // Validate fields
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      // Check required environment variables
      if (!process.env.WEB3FORMS_ACCESS_KEY) {
        console.error("Missing WEB3FORMS_ACCESS_KEY");
        return res.status(500).json({
          success: false,
          message: "Server error: Missing Web3Forms API key",
        });
      }
  
      if (!process.env.RECIPIENT_EMAIL) {
        console.error("Missing RECIPIENT_EMAIL");
        return res.status(500).json({
          success: false,
          message: "Server error: Missing recipient email",
        });
      }
  
      // Send to Web3Forms
      const formData = new URLSearchParams();
      formData.append("access_key", process.env.WEB3FORMS_ACCESS_KEY);
      formData.append("subject", "New Contact Form Message from Portfolio");
      formData.append("to", process.env.RECIPIENT_EMAIL);
      formData.append("from_name", name);
      formData.append("from_email", email);
      formData.append("message", message);

      console.log("Sending email to Web3Forms...");
      console.log("Recipient:", process.env.RECIPIENT_EMAIL);
      console.log("From:", email);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await response.json();
      console.log("Web3Forms Response Status:", response.status);
      console.log("Web3Forms Response Data:", JSON.stringify(data));

      if (response.ok && data.success) {
        console.log("Email sent successfully!");
        return res.status(200).json({
          success: true,
          message: "Email sent successfully!",
        });
      } else {
        console.error("Web3Forms Error:", data);
        return res.status(500).json({
          success: false,
          message: data.message || "Failed to send email",
          details: data,
        });
      }
    } catch (error) {
      console.error("Server Error:", error);
      console.error("Error Stack:", error.stack);
      console.error("Request Body:", req.body);
      return res.status(500).json({
        success: false,
        message: "Server error. Try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  
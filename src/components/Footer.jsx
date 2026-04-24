import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={footerStyle}>
      {/* Font Awesome CDN for real icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* Animation Styles */}
      <style>{`
        .footer-link { transition: all 0.3s ease; position: relative; width: fit-content; }
        .footer-link:hover { color: #16A34A !important; transform: translateX(5px); }
        
        .social-icon { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .social-icon:hover { 
          background: #16A34A !important; 
          color: #fff !important; 
          transform: translateY(-5px) rotate(8deg);
          border-color: #16A34A !important;
          box-shadow: 0 5px 15px rgba(22, 163, 74, 0.3);
        }

        .play-btn { transition: all 0.3s ease; }
        .play-btn:hover { 
          background: #ffffff !important; 
          border-color: #16A34A !important; 
          transform: scale(1.02);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .email-link { transition: opacity 0.3s ease; }
        .email-link:hover { opacity: 0.8; text-decoration: underline !important; }

        /* Mobile footer stack */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }

          .footer-section {
            width: 100% !important;
          }

          .footer-section h4 {
            font-size: 12px !important;
            margin-bottom: 18px !important;
          }

          .footer-section a {
            display: block !important;
            margin-bottom: 12px !important;
            font-size: 13px !important;
          }

          .footer-logo-section {
            padding-bottom: 20px !important;
            border-bottom: 1px solid #f2f2f2 !important;
            margin-bottom: 20px !important;
          }

          .footer-logo-section img {
            height: 50px !important;
          }

          .footer-logo-section p {
            font-size: 13px !important;
            margin-bottom: 20px !important;
          }

          .play-btn {
            width: 100% !important;
            justify-content: center !important;
          }

          .footer-bottom {
            flex-direction: column !important;
            gap: 20px !important;
            align-items: flex-start !important;
          }

          .footer-socials {
            width: 100% !important;
            gap: 16px !important;
          }

          .footer-socials span {
            display: block !important;
            margin-bottom: 12px !important;
            font-size: 11px !important;
          }

          .footer-socials a {
            display: inline-flex !important;
          }
        }

        @media (max-width: 360px) {
          .footer-grid {
            gap: 30px !important;
          }

          .footer-section h4 {
            font-size: 11px !important;
            margin-bottom: 14px !important;
          }

          .footer-section a {
            font-size: 12px !important;
            margin-bottom: 10px !important;
          }

          .social-icon {
            width: 34px !important;
            height: 34px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>

        <div style={gridStyle} className="footer-grid">

          {/* Column 1 - Logo & Description */}
          <div className="footer-section footer-logo-section">
            <div style={{ overflow: "hidden", height: 60 }}>
              <img
                src="/logo.png"
                alt="Divasa Fresh"
                style={{
                  height: 50,
                  transform: "scale(3.2)",
                  transformOrigin: "left center"
                }}
              />
            </div>

            <p style={descriptionStyle}>
              Rebuilding agricultural supply chains through transparency,
              ethical sourcing, and direct farm-to-market ecosystems.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="https://play.google.com/store/apps/details?id=com.divasafresh.app" target="_blank" rel="noopener noreferrer" className="play-btn" style={playButtonStyle}>
                <i className="fa-brands fa-google-play" style={{ fontSize: 20, marginRight: 12, color: "#111" }}></i>
                <div>
                  <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.8 }}>
                    Get it on
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    Google Play
                  </div>
                </div>
              </a>
              <a href="https://apps.apple.com/in/app/divasa-fresh/id6743688031" target="_blank" rel="noopener noreferrer" className="play-btn" style={{ ...playButtonStyle, background: "#111", color: "#fff", border: "1px solid #222" }}>
                <i className="fa-brands fa-apple" style={{ fontSize: 20, marginRight: 12, color: "#fff" }}></i>
                <div>
                  <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.85 }}>
                    Download on the
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    App Store
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h4 style={headingStyle}>Company</h4>
            <div style={linkColumn}>
              <Link to="/" className="footer-link" style={linkStyle}>Home</Link>
              <Link to="/about" className="footer-link" style={linkStyle}>About Us</Link>
              <Link to="/mission" className="footer-link" style={linkStyle}>Our Mission</Link>
              <Link to="/vision" className="footer-link" style={linkStyle}>Vision 2030</Link>
              <Link to="/contact" className="footer-link" style={linkStyle}>Contact</Link>
            </div>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4 style={headingStyle}>Legal</h4>
            <div style={linkColumn}>
              <Link to="/terms" className="footer-link" style={linkStyle}>Terms of Service</Link>
              <Link to="/privacy" className="footer-link" style={linkStyle}>Privacy Policy</Link>
              <Link to="/delivery-areas" className="footer-link" style={linkStyle}>Delivery Areas</Link>
              <Link to="/shipping-policy" className="footer-link" style={linkStyle}>
                Shipping & Delivery Policy
              </Link>

              <Link to="/refund-policy" className="footer-link" style={linkStyle}>
                Refund Policy
              </Link>

            </div>
          </div>

          {/* Partnerships */}
          <div className="footer-section">
            <h4 style={headingStyle}>Partnerships</h4>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
              For B2B & Institutional inquiries:
            </p>
            <a
              href="mailto:contact@divasfresh.in"
              className="email-link"
              style={{
                color: "#16A34A",
                fontWeight: 700,
                textDecoration: "none",
                display: "block"
              }}
            >
              contact@divasfresh.in
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={bottomBarStyle} className="footer-bottom">
          <p style={copyrightStyle}>
            © 2024 Divasa Fresh. All rights reserved.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }} className="footer-socials">
            <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Follow us on:</span>
            <a href="https://www.linkedin.com/company/divasafresh/" target="_blank" rel="noopener noreferrer" className="social-icon" style={socialIconStyle}>
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61582916816410" target="_blank" rel="noopener noreferrer" className="social-icon" style={socialIconStyle}>
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/divasafresh/" target="_blank" rel="noopener noreferrer" className="social-icon" style={socialIconStyle}>
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.youtube.com/@DivasaFresh" target="_blank" rel="noopener noreferrer" className="social-icon" style={socialIconStyle}>
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* ===== STYLES ===== */

const footerStyle = {
  padding: "60px 5% 30px",
  background: "#ffffff",
  borderTop: "1px solid #f2f2f2",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  width: "100%"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 50,
  marginBottom: 40
};

const headingStyle = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "2px",
  marginBottom: 20,
  color: "#111"
};

const linkColumn = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const linkStyle = {
  textDecoration: "none",
  color: "#666",
  fontSize: 13,
  display: "inline-block"
};

const descriptionStyle = {
  color: "#666",
  fontSize: 13,
  lineHeight: 1.6,
  marginBottom: 24,
  maxWidth: 320
};

const playButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  background: "#f8f9fa",
  padding: "12px 20px",
  borderRadius: "14px",
  textDecoration: "none",
  color: "#111",
  border: "1px solid #eee",
  gap: 8
};

const bottomBarStyle = {
  borderTop: "1px solid #f2f2f2",
  paddingTop: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 16
};

const copyrightStyle = {
  color: "#aaa",
  fontSize: 10,
  letterSpacing: 1,
  textTransform: "uppercase",
  margin: 0
};

const socialIconStyle = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  background: "#f8f9fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  color: "#444",
  border: "1px solid #eee",
  cursor: "pointer",
  textDecoration: "none"
};

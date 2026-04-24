import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export default function CustomerLoginModal({ onClose, onSuccess, isOpen }) {
  const [phone, setPhone] = useState("");
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState(30);
  const OTP_LENGTH = 6;
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef([]);

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
  const otp = otpDigits.join("");

  useEffect(() => {
    setStep("phone");
    setPhone("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setName("");
    setError("");
  }, []);

  useEffect(() => {
    const openModal = () => setShow(true);

    window.addEventListener("openLoginModal", openModal);

    return () => {
      window.removeEventListener("openLoginModal", openModal);
    };
  }, []);

  useEffect(() => {
    if (typeof isOpen === "boolean") {
      setShow(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== "otp") return;
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
    }
  }, [step]);

  const closeModal = () => {
    setShow(false);
    onClose && onClose();
  };

  const handleSendOtp = async () => {
    if (isSendingOtp) return;

    if (normalizedPhone.length !== 10) {
      setError("Enter valid 10 digit phone number");
      return;
    }

    setError("");
    setTimer(30);
    setIsSendingOtp(true);

    try {
      await api.post("/customer/send-otp", { phone: normalizedPhone, name });
      setStep("otp");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to send OTP. Please check your internet or backend API URL."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isVerifyingOtp) return;

    if (!name || name.trim() === "") {
      setError("Name is required");
      return;
    }

    if (!otp || otp.trim() === "") {
      setError("Enter OTP");
      return;
    }

    setError("");
    setIsVerifyingOtp(true);

    try {
      const res = await api.post("/customer/verify-otp", {
        phone: normalizedPhone,
        otp: otp.toString().trim(),
        name,
      });

      localStorage.setItem("divasa_token", res.data.token);
      localStorage.setItem("divasa_user", JSON.stringify(res.data.customer));

      window.dispatchEvent(new Event("userUpdated"));

      onSuccess && onSuccess();
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpInputChange = (index, value) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    let cursor = index;
    for (const digit of digitsOnly) {
      if (cursor >= OTP_LENGTH) break;
      nextDigits[cursor] = digit;
      cursor += 1;
    }
    setOtpDigits(nextDigits);

    const focusIndex = Math.min(cursor, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;

    if (otpDigits[index]) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    if (index > 0) {
      const nextDigits = [...otpDigits];
      nextDigits[index - 1] = "";
      setOtpDigits(nextDigits);
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedDigits = (event.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");
    if (!pastedDigits.length) return;

    const nextDigits = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pastedDigits.length; i += 1) {
      nextDigits[i] = pastedDigits[i];
    }
    setOtpDigits(nextDigits);
    const focusIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 7000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 24,
          width: 420,
          textAlign: "center",
          position: "relative",
          maxWidth: "95vw",
        }}
      >
        <div
          onClick={closeModal}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            cursor: "pointer",
            fontSize: 20,
          }}
        >
          ←
        </div>

        <img
          src="/logo.png"
          alt="logo"
          style={{
            height: 60,
            marginBottom: 10,
            transform: "scale(4.2)",
            transformOrigin: "center",
          }}
        />

        <h3 style={{ margin: 0 }}>Healthy Living Starts Here</h3>
        <p style={{ color: "#666", marginBottom: 20 }}>Log in or Sign up</p>

        {step === "phone" ? (
          <>
            <div
              style={{
                display: "flex",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 15,
              }}
            >
              <span style={{ marginRight: 8 }}>+91</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (error) setError("");
                }}
                placeholder="Enter phone number"
                inputMode="numeric"
                maxLength={10}
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                }}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={isSendingOtp}
              style={{
                width: "100%",
                height: 45,
                background: "#22C55E",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 600,
                cursor: isSendingOtp ? "not-allowed" : "pointer",
                opacity: isSendingOtp ? 0.75 : 1,
              }}
            >
              {isSendingOtp ? "Sending..." : "Continue"}
            </button>
          </>
        ) : (
          <>
            <p>Enter OTP sent to +91 {normalizedPhone}</p>
            <div
              onPaste={handleOtpPaste}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={`otp-${index}`}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => {
                    handleOtpInputChange(index, e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  inputMode="numeric"
                  maxLength={1}
                  style={{
                    width: 48,
                    height: 52,
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    outline: "none",
                  }}
                />
              ))}
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              style={{
                width: "100%",
                height: 45,
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 600,
                cursor: isVerifyingOtp ? "not-allowed" : "pointer",
                opacity: isVerifyingOtp ? 0.75 : 1,
              }}
            >
              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>

            <p style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
              {timer > 0 ? (
                <>
                  Resend OTP in <b>{timer}s</b>
                </>
              ) : (
                <span
                  onClick={handleSendOtp}
                  style={{ color: "#22C55E", cursor: "pointer", fontWeight: 600 }}
                >
                  Resend OTP
                </span>
              )}
            </p>
          </>
        )}

        {error && <p style={{ color: "red", marginTop: 10, fontSize: 13 }}>{error}</p>}
      </div>
    </div>
  );
}

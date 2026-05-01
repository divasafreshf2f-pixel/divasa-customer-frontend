import { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function CustomerLoginModal({ onClose, onSuccess, isOpen }) {
  const OTP_LENGTH = 6;

  const [show, setShow] = useState(false);
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isCheckingOtp, setIsCheckingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  const otpRefs = useRef([]);
  const autoVerifyTriggeredRef = useRef(false);

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
  const isValidIndianPhone = /^[6-9]\d{9}$/.test(normalizedPhone);
  const otp = otpDigits.join("");

  useEffect(() => {
    if (typeof isOpen === "boolean") setShow(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const openModal = () => setShow(true);
    window.addEventListener("openLoginModal", openModal);
    return () => window.removeEventListener("openLoginModal", openModal);
  }, []);

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const id = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    }
  }, [step]);

  useEffect(() => {
    if (step !== "otp") return;
    if (otpDigits.some((d) => !d)) {
      autoVerifyTriggeredRef.current = false;
      setOtpVerified(false);
      return;
    }
    if (isCheckingOtp || isVerifyingOtp) return;
    if (autoVerifyTriggeredRef.current) return;
    autoVerifyTriggeredRef.current = true;
    handleCheckOtp();
  }, [otpDigits, step, isCheckingOtp, isVerifyingOtp]);

  const resetState = () => {
    setStep("phone");
    setPhone("");
    setName("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setTimer(30);
    setError("");
    setInfo("");
    setOtpVerified(false);
    setIsNewUser(true);
    autoVerifyTriggeredRef.current = false;
  };

  const closeModal = () => {
    setShow(false);
    resetState();
    onClose && onClose();
  };

  const completeLogin = (data) => {
    localStorage.setItem("divasa_token", data.token);
    localStorage.setItem("divasa_user", JSON.stringify(data.customer));
    window.dispatchEvent(new Event("userUpdated"));
    onSuccess && onSuccess();
    closeModal();
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setTimer(30);
      setError("");
      setInfo("");
      autoVerifyTriggeredRef.current = false;
      return;
    }
    closeModal();
  };

  const handleSendOtp = async () => {
    if (!isValidIndianPhone) {
      setError("Enter valid 10 digit phone number starting with 6-9");
      return;
    }
    setIsSendingOtp(true);
    setError("");
    setInfo("");
    try {
      const res = await api.post("/customer/send-otp", { phone: normalizedPhone });
      setStep("otp");
      setTimer(30);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setIsNewUser(Boolean(res?.data?.isNewUser));
      setOtpVerified(false);
      setInfo(res?.data?.message || "OTP sent successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCheckOtp = async () => {
    if (otp.length !== OTP_LENGTH) return;
    setIsCheckingOtp(true);
    setError("");
    try {
      const res = await api.post("/customer/check-otp", {
        phone: normalizedPhone,
        otp,
      });
      setOtpVerified(true);
      const newUser = Boolean(res?.data?.isNewUser);
      setIsNewUser(newUser);
      setInfo("OTP verified");

      // Old users: OTP-only login flow.
      if (!newUser) {
        const loginRes = await api.post("/customer/verify-otp", {
          phone: normalizedPhone,
          otp,
        });
        completeLogin(loginRes.data);
      }
    } catch (err) {
      autoVerifyTriggeredRef.current = false;
      setOtpVerified(false);
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsCheckingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpVerified) {
      setError("Please enter valid OTP");
      return;
    }
    if (isNewUser && !name.trim()) {
      setError("Name is required");
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setError("Enter valid OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setError("");
    setInfo("");
    try {
      const res = await api.post("/customer/verify-otp", {
        phone: normalizedPhone,
        otp,
        ...(isNewUser ? { name: name.trim() } : {}),
      });
      completeLogin(res.data);
    } catch (err) {
      autoVerifyTriggeredRef.current = false;
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpInput = (index, raw) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    let cursor = index;
    for (const d of digits) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = d;
      cursor += 1;
    }
    setOtpDigits(next);
    otpRefs.current[Math.min(cursor, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;

    if (otpDigits[index]) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    if (index > 0) {
      const next = [...otpDigits];
      next[index - 1] = "";
      setOtpDigits(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const digits = (event.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < digits.length; i += 1) next[i] = digits[i];
    setOtpDigits(next);
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <button onClick={handleBack} style={styles.backBtn} aria-label="Back">
          ←
        </button>

        <img src="/logo.png" alt="Divasa Fresh" style={styles.logo} />
        <h2 style={styles.title}>Healthy Living Starts Here</h2>
        <p style={styles.subtitle}>Log in or Sign up</p>

        {step === "phone" ? (
          <>
            <div style={styles.phoneWrap}>
              <span style={styles.countryCode}>+91</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (error) setError("");
                }}
                placeholder="Enter mobile number"
                style={styles.phoneInput}
              />
            </div>

            <button onClick={handleSendOtp} disabled={isSendingOtp} style={styles.primaryBtn}>
              {isSendingOtp ? "Sending..." : "Continue"}
            </button>

            <p style={styles.terms}>
              By continuing, you agree to our{" "}
              <a href="/terms" target="_blank" rel="noreferrer" style={styles.link}>Terms of service</a>{" "}
              &{" "}
              <a href="/privacy" target="_blank" rel="noreferrer" style={styles.link}>Privacy policy</a>
            </p>
          </>
        ) : (
          <>
            <p style={styles.otpHint}>Enter OTP sent to +91 {normalizedPhone}</p>

            <div style={styles.otpRow} onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={`otp-${idx}`}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    handleOtpInput(idx, e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={styles.otpInput}
                />
              ))}
            </div>

            {isNewUser ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your name"
                  style={styles.nameInput}
                />

                <button onClick={handleVerifyOtp} disabled={isVerifyingOtp || !otpVerified} style={styles.primaryBtn}>
                  {isVerifyingOtp ? "Continuing..." : "Continue"}
                </button>
              </>
            ) : (
              <button onClick={handleVerifyOtp} disabled={isVerifyingOtp || !otpVerified} style={styles.primaryBtn}>
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            )}

            <p style={styles.resendText}>
              {timer > 0 ? (
                <>Resend OTP in <b>{timer}s</b></>
              ) : (
                <span onClick={handleSendOtp} style={styles.resendAction}>Resend OTP</span>
              )}
            </p>
          </>
        )}

        {info ? <p style={styles.info}>{info}</p> : null}
        {error ? <p style={styles.error}>{error}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(2px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 7000,
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 540,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbf7 100%)",
    borderRadius: 24,
    padding: "22px 28px 24px",
    boxShadow: "0 28px 64px rgba(15,23,42,0.18)",
    border: "1px solid #e8efe6",
    position: "relative",
    textAlign: "center",
  },
  backBtn: {
    position: "absolute",
    left: 18,
    top: 16,
    border: "none",
    background: "transparent",
    fontSize: 26,
    cursor: "pointer",
    color: "#111827",
    lineHeight: 1,
  },
  logo: {
    height: 82,
    margin: "0 auto 8px",
    display: "block",
    objectFit: "contain",
    transform: "scale(2.1)"
  },
  title: {
    margin: "0 5px 4px 0",
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: "#0f172a",
  },
  subtitle: {
    margin: "0 0 18px 0",
    color: "#475569",
    fontSize: 17,
  },
  phoneWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d9e3d7",
    borderRadius: 16,
    padding: "0 14px",
    height: 56,
    marginBottom: 14,
    background: "#fff",
  },
  countryCode: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 20,
    color: "#111827",
    background: "transparent",
  },
  primaryBtn: {
    width: "100%",
    height: 54,
    border: "none",
    borderRadius: 16,
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    cursor: "pointer",
  },
  terms: {
    margin: "14px 2px 0",
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.5,
  },
  link: {
    color: "#0f172a",
    textDecoration: "underline",
  },
  otpHint: {
    margin: "0 0 12px 0",
    color: "#334155",
    fontSize: 15,
  },
  otpRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  otpInput: {
    width: 64,
    height: 58,
    border: "1px solid #d6e2d3",
    borderRadius: 14,
    textAlign: "center",
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    outline: "none",
    background: "#fff",
  },
  nameInput: {
    width: "100%",
    height: 54,
    border: "1px solid #d6e2d3",
    borderRadius: 14,
    padding: "0 14px",
    fontSize: 17,
    marginBottom: 12,
    outline: "none",
    background: "#fff",
  },
  resendText: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: 13,
  },
  resendAction: {
    color: "#16a34a",
    fontWeight: 700,
    cursor: "pointer",
  },
  info: {
    marginTop: 10,
    color: "#166534",
    fontSize: 13,
  },
  error: {
    marginTop: 10,
    color: "#dc2626",
    fontSize: 13,
  },
};

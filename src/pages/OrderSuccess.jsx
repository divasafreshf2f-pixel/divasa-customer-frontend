import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const isBulk = searchParams.get("type") === "bulk";

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .success-wrap {
            padding: 60px 16px !important;
            min-height: 70vh !important;
          }
          .success-wrap h1 { font-size: 22px !important; }
          .success-wrap p { font-size: 14px !important; }
          .success-btn { padding: 12px 24px !important; font-size: 14px !important; border-radius: 10px !important; }
        }
      `}</style>
      <div
        className="success-wrap"
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 20,
        }}
      >
        <h1>{isBulk ? "Bulk Order Placed Successfully!" : "Order Placed Successfully!"}</h1>

        <p style={{ marginTop: 10, fontSize: 16 }}>
          Thank you for ordering from <strong>Divasa Fresh</strong>.
        </p>

        <p>
          {isBulk
            ? "Your bulk event order has been received and is now visible in Bulk Orders."
            : "Your order has been received and will be packed shortly."}
        </p>

        <Link
          className="success-btn"
          to={isBulk ? "/my-bulk-orders" : "/"}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#22C55E",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {isBulk ? "View Bulk Orders" : "Continue Shopping"}
        </Link>
      </div>
    </>
  );
}

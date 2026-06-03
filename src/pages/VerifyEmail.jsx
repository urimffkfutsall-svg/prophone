import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Po verifikohet email-i juaj...");
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          setStatus("error");
          setMessage("Sesioni nuk u gjet. Provoni perseri linkun nga email-i, ose kerkoni nje te ri.");
          return;
        }
        if (!session.user.email_confirmed_at) {
          setStatus("error");
          setMessage("Email-i nuk eshte konfirmuar ende. Kontrolloni inbox-in tuaj.");
          return;
        }
        const { error: updateErr } = await supabase
          .from("accounts")
          .update({ is_verified: true })
          .eq("email", session.user.email);
        if (updateErr) console.warn("accounts update warning:", updateErr);

        setStatus("success");
        setMessage("Email-i juaj u verifikua me sukses. Tani mund te kyçeni ne aplikacion.");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Ndodhi nje gabim gjate verifikimit. Provoni perseri me vone.");
      }
    }
    verify();
  }, []);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {status === "loading" && <div className="verify-spinner"></div>}
        {status === "success" && <div className="verify-icon-success">✅</div>}
        {status === "error" && <div className="verify-icon-error">⚠️</div>}

        <h1 className="verify-title">
          {status === "loading" && "Po verifikohet..."}
          {status === "success" && "Faleminderit!"}
          {status === "error" && "Verifikim i pasukseshëm"}
        </h1>
        <p className="verify-message">{message}</p>

        {status === "success" && (
          <button className="verify-btn" onClick={() => navigate("/")}>Kalo te kyqja →</button>
        )}
        {status === "error" && (
          <button className="verify-btn-secondary" onClick={() => navigate("/")}>Kthehu ne fillim</button>
        )}
      </div>
    </div>
  );
}
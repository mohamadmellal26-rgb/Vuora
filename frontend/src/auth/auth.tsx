import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import "./auth.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const API_URL = "http://localhost:8080";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const endpoint = isLogin ? "/login" : "/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ ما، يرجى المحاولة لاحقاً");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        setSuccessMsg("تم تسجيل الدخول بنجاح! جاري توجيهك...");
        setTimeout(() => {
          navigate("/home");
        }, 1200);
      } else {
        // عند التسجيل بنجاح، نحتفظ بالبريد وكلمة المرور وننتقل لوضع تسجيل الدخول
        // لكي لا يضطر المستخدم لإعادة كتابتهما، بل يضغط Sign In مباشرة
        setSuccessMsg("تم إنشاء الحساب بنجاح! يمكنك الضغط على Sign In لدخول الحساب.");
        setIsLogin(true); 
        // ملاحظة: لا نقوم بتفريغ الـ password والـ email هنا حتى يبقى البريد وكلمة المرور جاهزين في الحقول
      }
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>{isLogin ? "Sign in to access your live streams" : "Join Vuora and start streaming live"}</p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button" 
            className={`tab-btn ${isLogin ? "active" : ""}`} 
            onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`tab-btn ${!isLogin ? "active" : ""}`} 
            onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
          >
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Mohamad Mellal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="auth-input"
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
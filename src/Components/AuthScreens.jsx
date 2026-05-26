import { useState } from "react";
import { F } from "../constants.js";
import { Icon, Btn, Shell, TextInput } from "./UI.jsx";

/* ── Forgot Password ── */
export function ForgotPasswordScreen({ supabase, onBack }) {
  const [email, setEmail]       = useState("");
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleReset = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin, // update with your deep link for native apps
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <Shell>
      <div style={{ paddingTop: 52 }}>
        <button onClick={onBack} style={{
          background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:"#9B8DB5",fontFamily:F.b,fontWeight:600,fontSize:15,
        }}>
          <Icon name="back" size={20} color="#9B8DB5"/> Back
        </button>

        <Icon name="mail" size={48} color="#7C4DFF" style={{ marginBottom: 16 }}/>
        <h2 style={{ fontFamily:F.h,fontSize:32,fontWeight:800,color:"#2D2040",marginBottom:4 }}>
          Forgot password?
        </h2>

        {sent ? (
          <>
            <p style={{ color:"#9B8DB5",fontSize:15,marginBottom:28,fontWeight:500,lineHeight:1.7 }}>
              We've sent a reset link to <strong style={{color:"#2D2040"}}>{email}</strong>.
              Check your inbox and follow the link to set a new password.
            </p>
            <div style={{
              background:"#E8F5E9",borderRadius:20,padding:"20px",
              display:"flex",alignItems:"center",gap:14,marginBottom:24,
            }}>
              <Icon name="check" size={28} color="#43A047"/>
              <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,color:"#2E7D32",margin:0,lineHeight:1.5}}>
                Email sent! It may take a minute to arrive. Check your spam folder if you don't see it.
              </p>
            </div>
            <Btn onClick={onBack} style={{ width:"100%" }} icon="back">Back to Sign In</Btn>
          </>
        ) : (
          <>
            <p style={{ color:"#9B8DB5",fontSize:15,marginBottom:28,fontWeight:500 }}>
              Enter your email and we'll send you a reset link.
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
              <TextInput
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
              />
            </div>
            {error && <p style={{ color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500 }}>{error}</p>}
            <Btn onClick={handleReset} style={{ width:"100%" }} icon="mail" loading={loading}>
              Send Reset Link
            </Btn>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ── Login Screen ── */
export function LoginScreen({ supabase, onNavigate, theme }) {
  const C = theme;
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleLogin = async () => {
    if (!email.trim()||!password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email:email.trim(), password });
    if (err) setError("Incorrect email or password.");
    setLoading(false);
  };

  return (
    <Shell>
      <div style={{ paddingTop: 52 }}>
        <button onClick={()=>onNavigate("landing")} style={{
          background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:15,
        }}>
          <Icon name="back" size={20} color={C.muted}/> Back
        </button>

        <Icon name="heart" size={48} color={C.pink} style={{ marginBottom:16 }}/>
        <h2 style={{ fontFamily:F.h,fontSize:32,fontWeight:800,color:C.text,marginBottom:4 }}>
          Welcome back
        </h2>
        <p style={{ color:C.muted,fontSize:15,marginBottom:28,fontWeight:500 }}>
          Sign in to your Bloomy account.
        </p>

        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
          <TextInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/>
          <TextInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"/>
        </div>

        {error && <p style={{ color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500 }}>{error}</p>}

        <Btn onClick={handleLogin} style={{ width:"100%" }} icon="next" loading={loading}>Sign In</Btn>

        {/* Forgot password link */}
        <p style={{ textAlign:"center",marginTop:16,color:C.muted,fontSize:14,fontWeight:500 }}>
          <span
            onClick={()=>onNavigate("forgot")}
            style={{ color:C.purple,cursor:"pointer",fontWeight:700 }}
          >
            Forgot your password?
          </span>
        </p>

        <p style={{ textAlign:"center",marginTop:8,color:C.muted,fontSize:14,fontWeight:500 }}>
          No account yet?{" "}
          <span onClick={()=>onNavigate("signup")} style={{ color:C.purple,cursor:"pointer",fontWeight:700 }}>
            Sign up free
          </span>
        </p>
      </div>
    </Shell>
  );
}

/* ── Signup Screen ── */
export function SignupScreen({ supabase, onNavigate, theme }) {
  const C = theme;
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSignup = async () => {
    if (!name.trim()||!email.trim()||!password.trim()) { setError("Please fill in all fields."); return; }
    if (password.length<6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { name: name.trim() } },
    });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <Shell>
      <div style={{ paddingTop: 52 }}>
        <button onClick={()=>onNavigate("consent")} style={{
          background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:15,
        }}>
          <Icon name="back" size={20} color={C.muted}/> Back
        </button>

        <Icon name="flower" size={48} color={C.purple} style={{ marginBottom:16 }}/>
        <h2 style={{ fontFamily:F.h,fontSize:32,fontWeight:800,color:C.text,marginBottom:4 }}>
          Create your account
        </h2>
        <p style={{ color:C.muted,fontSize:15,marginBottom:28,fontWeight:500 }}>
          Free forever. No credit card needed.
        </p>

        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
          <TextInput value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          <TextInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/>
          <TextInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6 characters)" type="password"/>
        </div>

        {error && <p style={{ color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500 }}>{error}</p>}

        <Btn onClick={handleSignup} style={{ width:"100%" }} icon="next" loading={loading}>
          Create Account
        </Btn>

        <p style={{ textAlign:"center",marginTop:20,color:C.muted,fontSize:14,fontWeight:500 }}>
          Already have an account?{" "}
          <span onClick={()=>onNavigate("login")} style={{ color:C.purple,cursor:"pointer",fontWeight:700 }}>
            Sign in
          </span>
        </p>
      </div>
    </Shell>
  );
}

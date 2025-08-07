import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Building, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/");
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;
    const companyName = formData.get("companyName") as string;

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      display_name: displayName,
      company_name: companyName,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(error.message);
      }
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '16px' 
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Swift Books</h1>
          <p style={{ color: '#666', margin: '0' }}>
            AI-powered accounting for Canadian freelancers
          </p>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          padding: '24px' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px 0' }}>Welcome</h2>
            <p style={{ color: '#666', margin: '0' }}>
              Sign in to your account or create a new one
            </p>
          </div>
          
          {error && (
            <div style={{ 
              background: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '4px', 
              padding: '12px', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#c00" />
              <span style={{ color: '#c00', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab("signin")}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: activeTab === "signin" ? '#2B6CB0' : '#f5f5f5',
                  color: activeTab === "signin" ? 'white' : '#333',
                  borderRadius: '4px 0 0 4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: activeTab === "signup" ? '#2B6CB0' : '#f5f5f5',
                  color: activeTab === "signup" ? 'white' : '#333',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <UserPlus size={16} />
                Sign Up
              </button>
            </div>

            {activeTab === "signin" && (
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="signin-email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} size={16} />
                    <input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signin-password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} size={16} />
                    <input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#2B6CB0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {activeTab === "signup" && (
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="displayName" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} size={16} />
                      <input
                        id="displayName"
                        name="displayName"
                        placeholder="John Doe"
                        required
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 40px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyName" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Company</label>
                    <div style={{ position: 'relative' }}>
                      <Building style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} size={16} />
                      <input
                        id="companyName"
                        name="companyName"
                        placeholder="Acme Inc."
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 40px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} size={16} />
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} size={16} />
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                    Password must be at least 6 characters long
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#2B6CB0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: '0' }}>🇨🇦 Built for Canadian tax compliance</p>
            <p style={{ margin: '4px 0 0 0' }}>GST/HST ready • CRA guidelines included</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
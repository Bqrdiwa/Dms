import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import SessionContext, { type Session } from "./SessionContext";
import { APPLICATION_TITLE } from "./Setting";
import LoadingLayout from "../layouts/LoadingLayout";
import { AnimatePresence } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

interface DecodedToken {
  exp: number;
  name?: string;
  email?: string;
  image?: string;
}

const SessionProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetchSessionData = async () => {
    setTimeout(() => {setLoading(false)}, 1000);
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (!isExpired) {
          fetchSessionData();
        } else {
          addToast({
            title: APPLICATION_TITLE,
            description: "توکن امتینی شما منقضی شده دوباره وارد شوید.",
            color: "warning",
          });
          localStorage.removeItem("access");
          nav(
            `/auth?callbackUrl=${encodeURIComponent(window.location.pathname)}`
          );
        }
      } catch (err) {
        nav(
          `/auth?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        );
      }
    } else {
      nav(`/auth?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, []);

  if (loading) {
    return <LoadingLayout />;
  }
  return (
    <SessionContext.Provider value={{ session, setSession }}>
      <AnimatePresence>
        {loading ? <LoadingLayout /> : children}
      </AnimatePresence>
    </SessionContext.Provider>
  );
};

export default SessionProvider;

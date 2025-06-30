import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect } from "react";

import "./tailwind.css";
import { getAuthSession, getUserProfile } from "~/lib/auth.server";
import { useStore } from "~/store/store";

console.log('🏠 Root - Component loading...');

export const links: LinksFunction = () => {
  console.log('🔗 Root - Loading external resources...');
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('📊 Root Loader - Starting...');
  
  try {
    const session = await getAuthSession(request);
    let userProfile = null;

    if (session?.user) {
      console.log('👤 Root Loader - User session found, fetching profile...');
      userProfile = await getUserProfile(session.user.id);
    } else {
      console.log('🔒 Root Loader - No user session found');
    }

    const envVars = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    };

    console.log('✅ Root Loader - Data prepared successfully');
    console.log('🔧 Root Loader - ENV vars:', {
      SUPABASE_URL: envVars.SUPABASE_URL ? 'Set' : 'Missing',
      SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    });

    return json({
      userProfile,
      ENV: envVars,
    });
  } catch (error) {
    console.error('❌ Root Loader - Error:', error);
    return json({
      userProfile: null,
      ENV: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
    });
  }
}

export default function App() {
  console.log('🏠 Root App - Rendering...');
  
  const { userProfile, ENV } = useLoaderData<typeof loader>();
  const { setCurrentUser } = useStore();

  useEffect(() => {
    console.log('👤 Root App - Setting current user:', userProfile ? 'User found' : 'No user');
    setCurrentUser(userProfile);
  }, [userProfile, setCurrentUser]);

  useEffect(() => {
    console.log('🔧 Root App - Setting up environment variables...');
    console.log('🌍 ENV check:', {
      SUPABASE_URL: ENV?.SUPABASE_URL ? 'Set' : 'Missing',
      SUPABASE_ANON_KEY: ENV?.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    });
    
    // Set environment variables for client-side use
    if (typeof window !== "undefined") {
      window.ENV = ENV;
      console.log('✅ Root App - Environment variables set on window object');
    }
  }, [ENV]);

  // Add debug logging for CSS
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log('🎨 CSS Debug - Checking if Tailwind is loaded...');
      const testElement = document.createElement('div');
      testElement.className = 'bg-red-500 w-1 h-1';
      document.body.appendChild(testElement);
      const computedStyle = window.getComputedStyle(testElement);
      const bgColor = computedStyle.backgroundColor;
      document.body.removeChild(testElement);
      
      if (bgColor === 'rgb(239, 68, 68)' || bgColor === '#ef4444') {
        console.log('✅ CSS Debug - Tailwind CSS is working correctly');
      } else {
        console.error('❌ CSS Debug - Tailwind CSS is not working. Background color:', bgColor);
      }
    }
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔧 Inline Script - Setting up ENV...');
              window.ENV = ${JSON.stringify(ENV)};
              console.log('✅ Inline Script - ENV set:', window.ENV);
            `,
          }}
        />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
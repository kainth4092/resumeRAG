import AppRoutes from "./routes/App_Routes";

export default function App() {
  return <AppRoutes />;
}

// import { useState, useEffect } from "react";
// import { LoginPage } from "./components/auth/LoginPage";
// import { SignupPage } from "./components/auth/SignupPage";

// function ProfileData() {
//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-foreground mb-2">Profile Data</h1>
//       <p className="text-sm text-muted-foreground mb-6">Your professional profile powers all AI-generated resumes.</p>
//       <div className="grid grid-cols-1 gap-4">
//         {["Work Experience", "Education", "Skills & Technologies", "Projects", "Certifications", "Awards"].map(section => (
//           <div key={section} className="bg-card border border-border rounded-xl p-5">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-foreground text-sm">{section}</h3>
//               <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">+ Add</button>
//             </div>
//             <div className="h-px bg-border mb-3" />
//             <p className="text-sm text-muted-foreground">No {section.toLowerCase()} added yet. Click Add to get started.</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// const PAGE_MAP = {
//   // dashboard: Dashboard,
//   // generator: ResumeGenerator,
//   // resumes: MyResumes,
//   // profile: ProfileData,
//   // templates: Templates,
//   // tracker: JobTracker,
//   // interview: InterviewPrep,
//   // settings: Settings,
// };

// // function DevModeSwitcher({
// //   mode, authScreen, onMode, onAuthScreen, darkMode, onToggleDark,
// // }) {
// //   const AUTH_SCREENS = ["login", "signup", "forgot", "verify"];
// //   return (
// //     <div className={`fixed top-0 left-0 right-0 z-[100] flex items-center gap-1 px-3 py-1.5 border-b ${darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-100 border-gray-200"}`}>
// //       <span className={`text-[10px] font-mono font-semibold mr-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>SCREENS</span>
// //       <button
// //         onClick={() => onMode("app")}
// //         className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${mode === "app" ? "bg-primary text-white" : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
// //       >
// //         Dashboard
// //       </button>
// //       {AUTH_SCREENS.map(s => (
// //         <button
// //           key={s}
// //           onClick={() => { onMode("auth"); onAuthScreen(s); }}
// //           className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all capitalize ${mode === "auth" && authScreen === s ? "bg-primary text-white" : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
// //         >
// //           {s}
// //         </button>
// //       ))}
// //       <div className="ml-auto flex items-center gap-1">
// //         <button
// //           onClick={onToggleDark}
// //           className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${darkMode ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
// //         >
// //           {darkMode ? "Dark" : "Light"}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// export default function App() {
//   const [page, setPage] = useState("dashboard");
//   const [darkMode, setDarkMode] = useState(false);
//   const [mode, setMode] = useState("auth");
//   const [authScreen, setAuthScreen] = useState("login");
//   const [signupEmail, setSignupEmail] = useState("jordan@example.com");

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   const handleLogin = () => {
//     setMode("app");
//   };

//   const handleNavigate = (screen) => {
//     setAuthScreen(screen);
//   };

//   // const PageComponent = PAGE_MAP[page] || Dashboard;

//   return (
//     <div className={mode === "auth" ? "pt-7" : "pt-7"}>
//       {/* <DevModeSwitcher
//         mode={mode}
//         authScreen={authScreen}
//         onMode={setMode}
//         onAuthScreen={setAuthScreen}
//         darkMode={darkMode}
//         onToggleDark={() => setDarkMode(d => !d)}
//       /> */}

//       {mode === "auth" ? (
//         <div>
//           {authScreen === "login" && (
//             <LoginPage
//               onNavigate={handleNavigate} onLogin={handleLogin} />
//           )}
//           {authScreen === "signup" && (
//             <SignupPage onNavigate={handleNavigate} />
//           )}
//           {authScreen === "forgot" && (
//             <ForgotPassword onNavigate={handleNavigate} />
//           )}
//           {authScreen === "verify" && (
//             <EmailVerification
//               email={signupEmail}
//               onNavigate={handleNavigate}
//               onVerify={handleLogin}
//             />
//           )}
//         </div>
//       ) : (
//         <Layout
//           activePage={page}
//           onPageChange={setPage}
//           darkMode={darkMode}
//           onToggleDark={() => setDarkMode(d => !d)}
//         >
//           <PageComponent />
//         </Layout>
//       )}
//     </div>
//   );
// }

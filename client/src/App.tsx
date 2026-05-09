import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Framework from "./pages/Framework";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Blueprint from "./pages/Blueprint";
import CourseLandingSMC from "./pages/CourseLandingSMC";
import Education from "./pages/Education";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Layout from "./components/Layout";
import { AuthProvider } from "@/lib/auth";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import CoursePlayer from "@/pages/CoursePlayer";
import Admin from "@/pages/Admin";
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/learn/:courseId" component={CoursePlayer} />
      <Route path="/learn/:courseId/:lessonId" component={CoursePlayer} />
      <Route path="/admin" component={Admin} />
      <Route>
        {() => (
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/framework" component={Framework} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={Article} />
              {/* /journal redirects — header link historically pointed here */}
              <Route path="/journal">{() => <Redirect to="/blog" />}</Route>
              <Route path="/journal/:slug">{(params) => <Redirect to={`/blog/${params.slug}`} />}</Route>
              <Route path="/about" component={About} />
              <Route path="/resources" component={Resources} />
              <Route path="/blueprint" component={Blueprint} />
              <Route path="/courses/smc-complete-guide" component={CourseLandingSMC} />
              <Route path="/education" component={Education} />
              <Route path="/refund-policy" component={RefundPolicy} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/terms" component={TermsOfUse} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
export default App;

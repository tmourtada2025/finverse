import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Framework from "./pages/Framework";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Blueprint from "./pages/Blueprint";
import Education from "./pages/Education";
import Layout from "./components/Layout";
import { AuthProvider } from "@/lib/auth";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import CoursePlayer from "@/pages/CoursePlayer";
import Admin from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
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
              <Route path="/about" component={About} />
              <Route path="/resources" component={Resources} />
              <Route path="/blueprint" component={Blueprint} />
              <Route path="/education" component={Education} />
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

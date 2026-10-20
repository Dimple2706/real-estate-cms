
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import App from "./App";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";

import {
  Overview,
  ContentManager,
  InquiryManager,
  ActivityLogs
} from "./admin/AdminDashboard";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="inquiries" element={<InquiryManager />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path=":type" element={<ContentManager />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

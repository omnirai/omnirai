"""
Quick AI Server — Real ChatGPT (GPT-4o), Gemini 1.5 & Claude 3.5 Integration
Created by bishalcodes.com
Zero 3rd-Party API Keys Required
"""

import os
import sys
import json
import urllib.parse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from quick_ai_engine import QuickAiEngine

PORT = 5050
engine = QuickAiEngine()

HTML_PAGE = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quick AI — Real ChatGPT, Gemini & Claude | Created by bishalcodes.com</title>
  
  <!-- Handcrafted Quick AI SVG Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36' fill='none'><rect width='36' height='36' rx='10' fill='%230f172a'/><defs><linearGradient id='qGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2334d399'/><stop offset='50%25' stop-color='%2310b981'/><stop offset='100%25' stop-color='%23059669'/></linearGradient></defs><rect x='1' y='1' width='34' height='34' rx='9' fill='none' stroke='url(%23qGrad)' stroke-width='1.5'/><path d='M18 9C13.03 9 9 13.03 9 18C9 22.97 13.03 27 18 27C20.15 27 22.12 26.24 23.66 24.97L27.29 28.61C27.68 29 28.31 29 28.7 28.61C29.09 28.22 29.09 27.59 28.7 27.2L25.13 23.63C26.31 22.1 27 20.13 27 18C27 13.03 22.97 9 18 9ZM18 12.5C21.04 12.5 23.5 14.96 23.5 18C23.5 21.04 21.04 23.5 18 23.5C14.96 23.5 12.5 21.04 12.5 18C12.5 14.96 14.96 12.5 18 12.5Z' fill='url(%23qGrad)'/><path d='M21 15L17.5 20H20.5L17 24.5' stroke='%23ffffff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>" />

  <!-- Real Firebase SDKs (v10 compat) -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics-compat.js"></script>

  <style>

    * { box-sizing: border-box; margin: 0; padding: 0; }
    /* Sleek Custom Dark Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #171717;
    }
    ::-webkit-scrollbar-thumb {
      background: #3a3a3a;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #505050;
    }
    .typing-dots {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .typing-dots span {
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 50%;
      display: inline-block;
      animation: pulseDot 1.4s infinite ease-in-out both;
    }
    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulseDot {
      0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.2); }
    }
    body {
      background-color: #171717;
      color: #ececec;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
    aside {
      width: 260px;
      background-color: #212121;
      border-right: 1px solid #303030;
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 14px;
      border-bottom: 1px solid #303030;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-badge {
      width: 28px; height: 28px; background: #ffffff; color: #000000;
      border-radius: 8px; font-weight: bold; font-size: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-title { font-weight: 600; font-size: 14px; color: #ffffff; }
    .logo-tag { font-size: 10px; font-family: monospace; color: #10b981; margin-left: 4px; }
    .new-chat-btn {
      width: calc(100% - 24px); margin: 12px; padding: 10px 14px;
      background: #171717; border: 1px solid #303030; border-radius: 12px;
      color: #ffffff; font-size: 13px; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 8px; transition: background 0.15s;
    }
    .new-chat-btn:hover { background: #2f2f2f; }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px; }
    .nav-label { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; padding: 4px 8px; margin-bottom: 4px; }
    .nav-item { padding: 8px 10px; font-size: 12px; color: #9ca3af; border-radius: 8px; cursor: pointer; }
    .nav-item:hover { color: #fff; background: #2f2f2f; }
    .sidebar-footer { padding: 12px; border-top: 1px solid #303030; margin-top: auto; }
    .brand-link { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .brand-avatar { width: 24px; height: 24px; border-radius: 50%; background: #fff; color: #000; font-weight: bold; font-size: 10px; display: flex; align-items: center; justify-content: center; }
    .brand-text { font-size: 12px; font-weight: 600; color: #fff; }
    .brand-sub { font-size: 10px; color: #10b981; }

    .main-wrapper {
      flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; position: relative; min-width: 0;
    }
    header {
      height: 56px; border-bottom: 1px solid #303030; padding: 0 16px;
      display: flex; align-items: center; justify-content: space-between; background: #171717; flex-shrink: 0;
    }
    .active-model-box { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9ca3af; }
    .badge-model-select {
      background: #212121;
      border: 1px solid #303030;
      padding: 6px 34px 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2310b981' viewBox='0 0 16 16'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>");
      background-repeat: no-repeat;
      background-position: right 12px center;
    }
    .badge-model-select:hover {
      background-color: #2a2a2a;
      border-color: #10b981;
    }
    .badge-model-select option {
      background-color: #212121;
      color: #ffffff;
      padding: 10px;
      font-size: 13px;
    }

    /* Custom Official SVG AI Models Dropdown */
    .custom-model-trigger {
      background: #212121;
      border: 1px solid #303030;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      outline: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .custom-model-trigger:hover {
      background-color: #2a2a2a;
      border-color: #10b981;
    }
    .custom-model-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 235px;
      background: #212121;
      border: 1px solid #383838;
      border-radius: 16px;
      padding: 6px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.65);
      z-index: 990;
      display: none;
      flex-direction: column;
      gap: 2px;
    }
    .custom-model-menu.show { display: flex; }
    .model-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.12s ease;
      color: #e5e5e5;
    }
    .model-menu-item:hover {
      background: #2f2f2f;
      color: #ffffff;
    }
    .model-menu-item.active {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      font-weight: 600;
    }
    .menu-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 20px; }
    .menu-text { font-size: 13px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .menu-badge { font-size: 10px; font-weight: 600; color: #9ca3af; background: #171717; padding: 2px 6px; border-radius: 6px; border: 1px solid #303030; }

    body.light-mode .custom-model-trigger { background: #ffffff; border-color: #e4e4e7; color: #18181b; }
    body.light-mode .custom-model-menu { background: #ffffff; border-color: #e4e4e7; box-shadow: 0 10px 30px rgba(0,0,0,0.12); }
    body.light-mode .model-menu-item { color: #27272a; }
    body.light-mode .model-menu-item:hover { background: #f4f4f5; color: #000000; }
    body.light-mode .model-menu-item.active { background: rgba(16, 185, 129, 0.12); color: #10b981; }
    body.light-mode .menu-badge { background: #f4f4f5; border-color: #e4e4e7; color: #71717a; }
    .header-link { font-size: 12px; color: #9ca3af; text-decoration: none; }
    .header-link:hover { color: #fff; }

    .messages-area {
      flex: 1; overflow-y: auto; padding: 24px 16px 200px 16px;
      max-width: 800px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;
    }
    .hero-box {
      margin: auto; text-align: center; max-width: 620px; padding: 32px 16px;
    }
    .hero-title {
      font-size: 32px; font-weight: 600; color: #fff; margin-bottom: 32px;
      background: linear-gradient(135deg, #ffffff 50%, #a7f3d0 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    .hero-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%;
    }
    .hero-card {
      padding: 16px 18px; background: #212121; border: 1px solid #303030; border-radius: 16px;
      color: #ececec; text-align: left; font-size: 13.5px; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 10px; transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .hero-card:hover {
      background: #282828; border-color: #10b981; transform: translateY(-2px);
      color: #ffffff; box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
    }


    .bottom-container {
      position: absolute; bottom: 16px; left: 16px; right: 16px;
      max-width: 768px; margin: 0 auto; z-index: 50; display: flex; flex-direction: column; gap: 8px;
    }
    .model-row {
      display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; scrollbar-width: none;
    }
    .model-row::-webkit-scrollbar { display: none; }
    .model-pill {
      display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px;
      font-size: 12px; font-weight: 500; color: #8e8e8e; background: transparent; border: 1px solid #303030; cursor: pointer; white-space: nowrap; transition: all 0.15s;
    }
    .model-pill:hover { color: #fff; background: #2f2f2f; }
    .model-pill.active {
      color: #fff; background: #3a3a3a; border: 2px solid #10b981; font-weight: 700;
    }
    .input-box-wrapper {
      background: #212121; border: 1px solid #303030; border-radius: 24px; padding: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 8px; width: 100%;
    }
    .input-row { display: flex; align-items: center; gap: 12px; width: 100%; }
    .paperclip-btn {
      width: 36px; height: 36px; border-radius: 50%; background: #2f2f2f; border: none;
      color: #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; flex-shrink: 0;
    }
    .paperclip-btn:hover { background: #3a3a3a; color: #fff; }
    .prompt-textarea {
      flex: 1; min-width: 0; background: transparent; border: none; outline: none;
      resize: none; color: #fff; font-size: 14px; font-family: inherit; line-height: 1.5; max-height: 140px; overflow-y: auto; padding: 4px 0;
    }
    .send-arrow-btn {
      width: 36px; height: 36px; border-radius: 50%; background: #ffffff; border: none;
      color: #000000; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; flex-shrink: 0; transition: background 0.15s;
    }
    .send-arrow-btn:hover { background: #e5e5e5; }
    
    .chat-bubble-user {
      display: flex; gap: 12px; justify-content: flex-end; width: 100%;
    }
    .chat-bubble-user .content {
      background: #2f2f2f; color: #fff; padding: 12px 16px; border-radius: 18px 18px 2px 18px; max-width: 85%; font-size: 14px; line-height: 1.6;
    }
    .chat-bubble-assistant {
      display: flex; gap: 14px; justify-content: flex-start; width: 100%;
    }
    .chat-bubble-assistant .content {
      background: transparent; border: none; color: #ececec; padding: 2px 0; max-width: 100%; font-size: 14.5px; line-height: 1.65; flex: 1; min-width: 0;
    }

    /* Clean Dynamic Markdown Styles (ChatGPT Style) */
    .md-inline-code {
      background: #27272a; padding: 2px 6px; border-radius: 6px;
      font-family: monospace; font-size: 13px; color: #10b981;
    }
    .md-hr { border: none; border-top: 1px solid #303030; margin: 16px 0; }
    .md-h1 { font-size: 20px; font-weight: 700; color: inherit; margin: 16px 0 8px 0; }
    .md-h2 { font-size: 17px; font-weight: 600; color: inherit; margin: 14px 0 6px 0; }
    .md-h3 { font-size: 15px; font-weight: 600; color: inherit; margin: 12px 0 4px 0; }
    .md-code-block {
      background: #09090b; padding: 14px; border-radius: 10px; overflow-x: auto;
      margin: 12px 0; border: 1px solid #303030; font-family: monospace; font-size: 13px; color: #e4e4e7;
    }

    /* Tables */
    .md-table-wrapper {
      overflow-x: auto; margin: 14px 0; border-radius: 10px;
      border: 1px solid #333336; background: #18181b;
    }
    .md-table {
      width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;
    }
    .md-table th {
      padding: 10px 14px; border-bottom: 1px solid #333336; border-right: 1px solid #333336;
      background-color: #222225; color: #10b981; font-weight: 600;
    }
    .md-table th:last-child { border-right: none; }
    .md-table td {
      padding: 10px 14px; border-bottom: 1px solid #28282b; border-right: 1px solid #28282b; color: #d4d4d8;
    }
    .md-table td:last-child { border-right: none; }
    .md-table tr:last-child td { border-bottom: none; }
    .md-table tr:nth-child(even) { background-color: #1c1c1f; }
    .avatar {
      width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; flex-shrink: 0;
    }
    .avatar-user { background: #2f2f2f; color: #fff; }
    .avatar-ai { background: #ffffff; color: #000000; }
    .file-chip {
      display: flex; align-items: center; gap: 8px; background: #2f2f2f; border: 1px solid #404040;
      padding: 6px 12px; border-radius: 12px; font-size: 12px; color: #fff; max-width: 320px;
    }
    .file-chip-hidden { display: none; }
    .footer-note { text-align: center; font-size: 11px; color: #6b7280; margin-top: 4px; }

    /* Status Pill Button */
    .status-pill-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
      border-radius: 9999px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; margin-left: 6px;
    }
    .status-pill-btn:hover { background: rgba(16, 185, 129, 0.25); border-color: #10b981; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background-color: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block; }

    /* Auth Header Button */
    .auth-header-btn {
      background: #10b981; color: #000000; border: none; padding: 6px 14px;
      border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .auth-header-btn:hover { background: #059669; color: #ffffff; }

    /* Modal Backdrop & Container */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(6px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
    }
    .modal-backdrop.show { opacity: 1; pointer-events: auto; }
    .modal-card {
      background: #212121; border: 1px solid #333333; border-radius: 20px;
      width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
      transform: scale(0.95); transition: transform 0.2s ease; color: #fff;
    }
    .modal-backdrop.show .modal-card { transform: scale(1); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .modal-title { font-size: 18px; font-weight: 700; color: #ffffff; }
    .modal-close-btn { background: none; border: none; color: #888; font-size: 20px; cursor: pointer; padding: 4px; }
    .modal-close-btn:hover { color: #fff; }

    /* Auth Tabs & Inputs */
    .auth-tabs { display: flex; border-bottom: 1px solid #333; margin-bottom: 16px; }
    .auth-tab { flex: 1; padding: 10px; text-align: center; font-size: 13px; font-weight: 600; color: #888; cursor: pointer; border-bottom: 2px solid transparent; }
    .auth-tab.active { color: #10b981; border-bottom-color: #10b981; }
    .form-group { margin-bottom: 14px; text-align: left; }
    .form-label { display: block; font-size: 11px; font-weight: 600; color: #aaa; margin-bottom: 6px; text-transform: uppercase; }
    .form-input {
      width: 100%; background: #171717; border: 1px solid #333; border-radius: 10px;
      padding: 10px 14px; color: #fff; font-size: 13px; outline: none; transition: border 0.15s;
    }
    .form-input:focus { border-color: #10b981; }
    .google-auth-btn {
      width: 100%; background: #ffffff; color: #1f1f1f; border: 1px solid #d4d4d8;
      border-radius: 10px; padding: 10px; font-size: 13px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 14px;
      transition: background 0.15s;
    }
    .google-auth-btn:hover { background: #f4f4f5; }
    .auth-divider { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #71717a; margin: 14px 0; }
    .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: #333; }
    body.light-mode .auth-divider::before, body.light-mode .auth-divider::after { background: #e4e4e7; }
    .auth-error-box {
      background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; display: none;
    }
    .form-submit-btn:hover { background: #059669; color: #fff; }


    /* Model Connection Status Cards */
    .status-card {
      display: flex; align-items: center; justify-content: space-between; background: #171717;
      border: 1px solid #303030; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;
    }
    .status-model-name { font-size: 13px; font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 8px; }
    .status-badge-green {
      background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700;
    }
    /* Mobile Menu Toggle Button */
    .mobile-menu-btn {
      display: none; background: #212121; border: 1px solid #303030; color: #ffffff;
      padding: 6px; border-radius: 8px; cursor: pointer; transition: background 0.15s; flex-shrink: 0;
    }
    .mobile-menu-btn:hover { background: #2a2a2a; }
    .sidebar-overlay {
      display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); z-index: 985;
    }

    .sidebar-close-btn {
      display: none;
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      line-height: 1;
      transition: all 0.15s ease;
    }
    .sidebar-close-btn:hover {
      color: #ffffff;
      background: #2a2a2a;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
      .sidebar-close-btn { display: flex; align-items: center; justify-content: center; }
      aside {
        position: fixed; top: 0; left: 0; bottom: 0; z-index: 990;
        width: 260px; transform: translateX(-100%); transition: transform 0.25s ease, box-shadow 0.25s ease;
        box-shadow: none;
      }
      aside.open {
        transform: translateX(0);
        box-shadow: 10px 0 30px rgba(0,0,0,0.4);
      }
      .sidebar-overlay.open { display: block; }

      header { padding: 0 10px; height: 52px; }
      .active-model-box { gap: 6px; font-size: 11px; }
      .badge-model-select { padding: 5px 26px 5px 10px; font-size: 12px; max-width: 140px; }
      .auth-header-btn { padding: 5px 10px; font-size: 11px; }
      .header-link { display: none; }
      .header-model-label { display: none; }

      .messages-area { padding: 14px 10px 170px 10px; gap: 16px; }
      .hero-box { padding: 20px 6px; }
      .hero-title { font-size: 22px; margin-bottom: 20px; }
      .hero-grid { grid-template-columns: 1fr; gap: 10px; }
      .hero-card { padding: 12px 14px; font-size: 13px; }

      .bottom-container { left: 8px; right: 8px; bottom: 8px; }
      .chat-bubble-user .content, .chat-bubble-assistant .content { max-width: 92%; font-size: 13.5px; padding: 12px 14px; }
    }
    /* Light Mode Variables & Styles */
    body.light-mode {
      background-color: #f4f4f5;
      color: #18181b;
    }
    body.light-mode aside {
      background-color: #ffffff;
      border-right-color: #e4e4e7;
    }
    body.light-mode .sidebar-header { border-bottom-color: #e4e4e7; }
    body.light-mode .logo-badge { background: #18181b; color: #ffffff; }
    body.light-mode .logo-title { color: #18181b; }
    body.light-mode .new-chat-btn { background: #f4f4f5; border-color: #e4e4e7; color: #18181b; }
    body.light-mode .new-chat-btn:hover { background: #e4e4e7; }
    body.light-mode .nav-item { color: #52525b; }
    body.light-mode .nav-item:hover { color: #18181b; background: #e4e4e7; }
    body.light-mode .sidebar-footer { border-top-color: #e4e4e7; }
    body.light-mode .brand-text { color: #18181b; }
    body.light-mode .brand-avatar { background: #18181b; color: #ffffff; }
    body.light-mode .sidebar-close-btn { color: #71717a; }
    body.light-mode .sidebar-close-btn:hover { color: #18181b; background: #e4e4e7; }
    body.light-mode .sidebar-overlay { background: rgba(0, 0, 0, 0.35); }
    body.light-mode aside.open { box-shadow: 10px 0 30px rgba(0,0,0,0.12); }

    /* Sidebar User Profile Card & Brand Link Card CSS */
    .sidebar-user-card {
      background: #171717;
      border: 1px solid #303030;
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.15s ease;
    }
    .user-card-name { color: #ffffff; }
    .user-card-close { color: #9ca3af; }
    .user-card-close:hover { color: #ef4444; }

    .brand-link-card {
      padding: 10px 12px;
      background: #171717;
      border: 1px solid #303030;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .brand-link-card:hover {
      background: #252525;
      border-color: #10b981;
    }
    .brand-text-name { color: #ffffff; }

    /* Light Mode Overrides for Sidebar Footer Cards */
    body.light-mode .sidebar-user-card {
      background: #f4f4f5 !important;
      border-color: #e4e4e7 !important;
      color: #18181b !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    body.light-mode .user-card-name {
      color: #18181b !important;
    }
    body.light-mode .user-card-close {
      color: #71717a !important;
    }
    body.light-mode .user-card-close:hover {
      color: #ef4444 !important;
    }

    body.light-mode .brand-link-card {
      background: #f4f4f5 !important;
      border-color: #e4e4e7 !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    body.light-mode .brand-link-card:hover {
      background: #e4e4e7 !important;
      border-color: #10b981 !important;
    }
    body.light-mode .brand-text-name {
      color: #18181b !important;
    }

    body.light-mode header {
      background: #ffffff;
      border-bottom-color: #e4e4e7;
    }
    body.light-mode .badge-model-select {
      background-color: #f4f4f5;
      border-color: #d4d4d8;
      color: #18181b;
    }
    body.light-mode .badge-model-select option {
      background-color: #ffffff;
      color: #18181b;
    }
    body.light-mode .mobile-menu-btn { background: #f4f4f5; border-color: #e4e4e7; color: #18181b; }
    body.light-mode .header-link { color: #71717a; }
    body.light-mode .header-link:hover { color: #18181b; }

    body.light-mode .hero-title {
      background: linear-gradient(135deg, #18181b 50%, #059669 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    body.light-mode .hero-card {
      background: #ffffff; border-color: #e4e4e7; color: #27272a; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    body.light-mode .hero-card:hover {
      background: #fafafa; border-color: #10b981; color: #000000; box-shadow: 0 6px 16px rgba(16, 185, 129, 0.2);
    }

    body.light-mode .input-box-wrapper {
      background: #ffffff; border-color: #d4d4d8; box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }
    body.light-mode .paperclip-btn { background: #f4f4f5; color: #52525b; }
    body.light-mode .paperclip-btn:hover { background: #e4e4e7; color: #18181b; }
    body.light-mode .prompt-textarea { color: #18181b; }
    body.light-mode .send-arrow-btn { background: #18181b; color: #ffffff; }
    body.light-mode .send-arrow-btn:hover { background: #27272a; }

    body.light-mode .chat-bubble-user .content { background: #f4f4f5; color: #18181b; border: 1px solid #e4e4e7; }
    body.light-mode .chat-bubble-assistant .content { background: transparent; color: #09090b; border: none; }
    body.light-mode .md-inline-code { background: #f4f4f5; color: #09090b; border: 1px solid #e4e4e7; }
    body.light-mode .md-hr { border-top-color: #e4e4e7; }
    body.light-mode .md-table-wrapper { background: #ffffff !important; border-color: #e4e4e7 !important; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    body.light-mode .md-table th { background-color: #f4f4f5 !important; color: #059669 !important; border-bottom-color: #e4e4e7 !important; border-right-color: #e4e4e7 !important; }
    body.light-mode .md-table td { color: #18181b !important; border-bottom-color: #e4e4e7 !important; border-right-color: #f4f4f5 !important; }
    body.light-mode .md-table tr:nth-child(even) { background-color: #fafafa !important; }
    body.light-mode .avatar-user { background: #e4e4e7; color: #18181b; }
    body.light-mode .avatar-ai { background: #18181b; color: #ffffff; }
    body.light-mode .footer-note { color: #71717a; }
    body.light-mode .footer-note a { color: #18181b !important; }

    body.light-mode .modal-card {
      background: #ffffff; border-color: #e4e4e7; color: #18181b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    body.light-mode .modal-title { color: #18181b; }
    body.light-mode .modal-close-btn { color: #71717a; }
    body.light-mode .modal-close-btn:hover { color: #18181b; }
    body.light-mode .form-input { background: #f4f4f5; border-color: #e4e4e7; color: #18181b; }

    /* Theme Picker Card Grid */
    .theme-picker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
    .theme-card {
      border: 2px solid #303030; background: #171717; border-radius: 14px;
      padding: 16px; text-align: center; cursor: pointer; transition: all 0.15s ease;
    }
    .theme-card:hover { border-color: #10b981; }
    .theme-card.active { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
    body.light-mode .theme-card { background: #f4f4f5; border-color: #e4e4e7; color: #18181b; }
    body.light-mode .theme-card.active { border-color: #10b981; background: rgba(16, 185, 129, 0.12); }
  </style>
</head>
<body>

  <!-- Left Sidebar -->
  <aside>
    <div class="sidebar-header" style="justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <rect width="36" height="36" rx="10" fill="#0f172a"/>
          <defs>
            <linearGradient id="qGradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399"/>
              <stop offset="50%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#059669"/>
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="34" height="34" rx="9" fill="none" stroke="url(#qGradHeader)" stroke-width="1.5"/>
          <path d="M18 9C13.03 9 9 13.03 9 18C9 22.97 13.03 27 18 27C20.15 27 22.12 26.24 23.66 24.97L27.29 28.61C27.68 29 28.31 29 28.7 28.61C29.09 28.22 29.09 27.59 28.7 27.2L25.13 23.63C26.31 22.1 27 20.13 27 18C27 13.03 22.97 9 18 9ZM18 12.5C21.04 12.5 23.5 14.96 23.5 18C23.5 21.04 21.04 23.5 18 23.5C14.96 23.5 12.5 21.04 12.5 18C12.5 14.96 14.96 12.5 18 12.5Z" fill="url(#qGradHeader)"/>
          <path d="M21 15L17.5 20H20.5L17 24.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div>
          <span class="logo-title">Quick AI</span>
          <span class="logo-tag">PRO AI</span>
        </div>
      </div>
      <button type="button" onclick="toggleMobileSidebar()" class="sidebar-close-btn" title="Close Sidebar">✕</button>
    </div>

    <button type="button" onclick="startNewChat()" class="new-chat-btn">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      <span>New chat</span>
    </button>

    <div class="sidebar-nav">
      <div class="nav-label" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Recent Chats</span>
        <button type="button" onclick="clearAllHistory()" style="background:none;border:none;color:#6b7280;font-size:10px;cursor:pointer;" title="Clear All History" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#6b7280'">Clear</button>
      </div>
      <div id="sidebar-history-list"></div>

      <div class="nav-label" style="margin-top:20px;">Preferences</div>
      <div class="nav-item" onclick="openAccountModal()" style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        <span>Account & Profile</span>
      </div>
      <div class="nav-item" onclick="openSettingsModal()" style="display:flex;align-items:center;gap:8px;">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        <span>Settings & Theme</span>
      </div>
    </div>

    <div class="sidebar-footer">
      <!-- Sidebar User Auth / Profile Badge -->
      <div id="sidebar-auth-box" style="margin-bottom:10px;"></div>

      <!-- bishalcodes.com Official Creator Card -->
      <a href="https://bishalcodes.com" target="_blank" class="brand-link-card">
        <div class="brand-avatar" style="background:linear-gradient(135deg, #10b981, #059669);color:#ffffff;font-weight:bold;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(16,185,129,0.3);flex-shrink:0;">⚡</div>
        <div style="flex:1;overflow:hidden;">
          <div class="brand-text-name" style="font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:4px;">
            bishalcodes.com <span style="color:#10b981;font-size:11px;" title="Official Verified Creator">✓</span>
          </div>
          <div class="brand-sub" style="font-size:10px;color:#10b981;font-weight:500;">Official AI Creator</div>
        </div>
      </a>
    </div>
  </aside>


  <!-- Sidebar Overlay for Mobile Drawer -->
  <div id="sidebar-overlay" onclick="toggleMobileSidebar()" class="sidebar-overlay"></div>

  <!-- Main Workspace -->
  <div class="main-wrapper">
    
    <!-- Top Header with Interactive Model Select Dropdown & Auth -->
    <header>
      <div class="active-model-box">
        <button type="button" id="mobile-menu-btn" onclick="toggleMobileSidebar()" class="mobile-menu-btn" title="Toggle Menu">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        <label class="header-model-label" style="color:#9ca3af;font-size:12px;font-weight:600;cursor:pointer;">Active Model:</label>
        
        <!-- Custom Official Vector SVG Model Dropdown -->
        <div class="custom-select-wrapper" style="position:relative;display:inline-block;">
          <button type="button" id="model-dropdown-trigger" onclick="toggleModelDropdown(event)" class="custom-model-trigger">
            <span id="trigger-icon" style="display:flex;align-items:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 23a6.0462 6.0462 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7948.7948 0 0 0 .7854 0l5.8341-3.3696v2.332a.0805.0805 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7854.7854 0 0 0 .3927.6813l5.8152 3.3554-2.02 1.1686a.0758.0758 0 0 1-.071 0l-4.8303-2.7913A4.4944 4.4944 0 0 1 2.3408 7.8956zm16.0963 3.8558L12.603 8.3817l2.02-1.1686a.0758.0758 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6773a.79.79 0 0 0-.4117-.6789zm2.5222-2.0304l-.142-.0852-4.7735-2.7582a.7948.7948 0 0 0-.7854 0L9.4243 10.2467V7.9147a.0805.0805 0 0 1 .0332-.0615l4.8303-2.7914a4.4992 4.4992 0 0 1 6.6759 4.6626zm-12.0194 4.8814l-2.02-1.1686a.071.071 0 0 1-.038-.052V7.799a4.504 4.504 0 0 1 7.3709-3.4536l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369z" fill="#10a37f"/></svg>
            </span>
            <span id="trigger-label" style="font-weight:600;">ChatGPT (GPT-4o)</span>
            <svg width="12" height="12" fill="#10b981" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>
          </button>
          
          <div id="model-dropdown-menu" class="custom-model-menu">
            <div class="model-menu-item active" data-model="gpt-4o" onclick="selectModelCustom('gpt-4o')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 23a6.0462 6.0462 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7948.7948 0 0 0 .7854 0l5.8341-3.3696v2.332a.0805.0805 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7854.7854 0 0 0 .3927.6813l5.8152 3.3554-2.02 1.1686a.0758.0758 0 0 1-.071 0l-4.8303-2.7913A4.4944 4.4944 0 0 1 2.3408 7.8956zm16.0963 3.8558L12.603 8.3817l2.02-1.1686a.0758.0758 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6773a.79.79 0 0 0-.4117-.6789zm2.5222-2.0304l-.142-.0852-4.7735-2.7582a.7948.7948 0 0 0-.7854 0L9.4243 10.2467V7.9147a.0805.0805 0 0 1 .0332-.0615l4.8303-2.7914a4.4992 4.4992 0 0 1 6.6759 4.6626zm-12.0194 4.8814l-2.02-1.1686a.071.071 0 0 1-.038-.052V7.799a4.504 4.504 0 0 1 7.3709-3.4536l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369z" fill="#10a37f"/></svg></span>
              <span class="menu-text">ChatGPT (GPT-4o)</span>
              <span class="menu-badge">OpenAI</span>
            </div>
            <div class="model-menu-item" data-model="perplexity" onclick="selectModelCustom('perplexity')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z" fill="#20b2aa"/><path d="M12 2V22M2 7L22 17M2 17L22 7" stroke="#20b2aa" stroke-width="1.5"/></svg></span>
              <span class="menu-text">Perplexity Sonar</span>
              <span class="menu-badge">Sonar</span>
            </div>
            <div class="model-menu-item" data-model="gemini-1.5-flash" onclick="selectModelCustom('gemini-1.5-flash')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#geminiGrad)"/><defs><linearGradient id="geminiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#4285F4"/><stop offset="50%" stop-color="#9B51E0"/><stop offset="100%" stop-color="#EA4335"/></linearGradient></defs></svg></span>
              <span class="menu-text">Gemini 1.5</span>
              <span class="menu-badge">Google</span>
            </div>
            <div class="model-menu-item" data-model="grok-2" onclick="selectModelCustom('grok-2')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#ffffff"/></svg></span>
              <span class="menu-text">Grok 2 (xAI)</span>
              <span class="menu-badge">xAI</span>
            </div>
            <div class="model-menu-item" data-model="claude-3-5-sonnet" onclick="selectModelCustom('claude-3-5-sonnet')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13.5 2H10.5L9 8.5L2.5 7V10L8.5 12L2.5 14V17L9 15.5L10.5 22H13.5L15 15.5L21.5 17V14L15.5 12L21.5 10V7L15 8.5L13.5 2Z" fill="#d97757"/></svg></span>
              <span class="menu-text">Claude 3.5</span>
              <span class="menu-badge">Anthropic</span>
            </div>
            <div class="model-menu-item" data-model="deepseek-reasoner" onclick="selectModelCustom('deepseek-reasoner')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#4d6bfe"/><path d="M7 13C7 13 9 17 12 17C15 17 17 13 17 13" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="9" r="1.5" fill="#ffffff"/><circle cx="15" cy="9" r="1.5" fill="#ffffff"/></svg></span>
              <span class="menu-text">DeepSeek R1</span>
              <span class="menu-badge">DeepSeek</span>
            </div>
            <div class="model-menu-item" data-model="native" onclick="selectModelCustom('native')">
              <span class="menu-icon"><svg width="18" height="18" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#0f172a"/><rect x="1" y="1" width="34" height="34" rx="9" fill="none" stroke="#10b981" stroke-width="1.5"/><path d="M18 9C13.03 9 9 13.03 9 18C9 22.97 13.03 27 18 27C20.15 27 22.12 26.24 23.66 24.97L27.29 28.61C27.68 29 28.31 29 28.7 28.61C29.09 28.22 29.09 27.59 28.7 27.2L25.13 23.63C26.31 22.1 27 20.13 27 18C27 13.03 22.97 9 18 9ZM18 12.5C21.04 12.5 23.5 14.96 23.5 18C23.5 21.04 21.04 23.5 18 23.5C14.96 23.5 12.5 21.04 12.5 18C12.5 14.96 14.96 12.5 18 12.5Z" fill="#10b981"/><path d="M21 15L17.5 20H20.5L17 24.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <span class="menu-text">Quick AI Native</span>
              <span class="menu-badge">Neural</span>
            </div>
          </div>
        </div>
      </div>

    </header>





    <!-- Thread Messages Area -->
    <div id="messages-container" class="messages-area">
      <div id="hero-welcome" class="hero-box">
        <h1 class="hero-title">Where will your curiosity take you today?</h1>
        <div class="hero-grid">
          <button type="button" onclick="sendQuickPrompt('Who created Quick AI?')" class="hero-card">
            <span>💡 Who created Quick AI?</span>
          </button>
          <button type="button" onclick="sendQuickPrompt('Write a Python function for binary search')" class="hero-card">
            <span>🐍 Python binary search algorithm</span>
          </button>
          <button type="button" onclick="sendQuickPrompt('What is weather? Explain deeply.')" class="hero-card">
            <span>🌧️ Explain how weather systems work</span>
          </button>
          <button type="button" onclick="sendQuickPrompt('/image A futuristic glowing cybernetic dragon at night')" class="hero-card">
            <span>🎨 Generate AI Image (2 free daily)</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Floating Bottom Input Bar (NO FORM TAG TO PREVENT RE-LOAD) -->
    <div class="bottom-container">
      
      <!-- Upload input & Chat Box Wrapper -->
      <input type="file" id="file-upload-input" onchange="handleFileSelected(event)" style="display:none;">

      
      <div class="input-box-wrapper">
        
        <div id="attached-file-badge" class="file-chip file-chip-hidden">
          <span>📎</span>
          <span id="attached-file-name" style="font-family:monospace;font-size:11px;">filename.txt</span>
          <button type="button" onclick="removeAttachedFile()" style="background:none;border:none;color:#aaa;font-weight:bold;cursor:pointer;margin-left:auto;">✕</button>
        </div>

        <div class="input-row">
          <button type="button" onclick="triggerFileUpload()" class="paperclip-btn" title="Attach file (up to 10MB)">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
          </button>

          <textarea id="user-input" rows="1" placeholder="Ask ChatGPT (GPT-4o), or attach a file..." oninput="this.style.height='auto';this.style.height=(this.scrollHeight)+'px';" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitPrompt();}" class="prompt-textarea"></textarea>

          <button type="button" id="send-btn" onclick="submitPrompt()" class="send-arrow-btn" title="Send message">
            ➔
          </button>
        </div>
      </div>

      <div class="footer-note">Quick AI • Advanced Neural Intelligence • Created by <a href="https://bishalcodes.com" target="_blank" style="color:#fff;">bishalcodes.com</a></div>
    </div>


  </div>

  <!-- Modal 1: Real Firebase Sign In / Sign Up Modal -->
  <div id="auth-modal" class="modal-backdrop" onclick="if(event.target===this) closeAuthModal()">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title" id="auth-modal-title">Sign In to Quick AI</div>
        <button type="button" onclick="closeAuthModal()" class="modal-close-btn">✕</button>
      </div>

      <div id="auth-error-msg" class="auth-error-box"></div>

      <button type="button" onclick="handleGoogleSignIn()" class="google-auth-btn">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        <span>Continue with Google</span>
      </button>

      <div class="auth-divider">or sign in with email</div>

      <div class="auth-tabs">
        <div id="tab-signin" class="auth-tab active" onclick="switchAuthTab('signin')">Sign In</div>
        <div id="tab-signup" class="auth-tab" onclick="switchAuthTab('signup')">Sign Up</div>
      </div>

      <form id="auth-form" onsubmit="handleAuthSubmit(event)">
        <div id="name-group" class="form-group" style="display:none;">
          <label class="form-label">Full Name</label>
          <input type="text" id="auth-name" class="form-input" placeholder="e.g. Bishal" />
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="auth-email" class="form-input" placeholder="user@bishalcodes.com" required />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="auth-pass" class="form-input" placeholder="••••••••" required />
        </div>

        <button type="submit" id="auth-submit-btn" class="form-submit-btn">Sign In</button>
      </form>
    </div>
  </div>


  <!-- Modal 2: AI Models 100% Connection Status Center -->
  <div id="model-status-modal" class="modal-backdrop" onclick="if(event.target===this) closeModelStatusModal()">
    <div class="modal-card" style="max-width:560px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">AI Engines Connection Status</div>
          <div style="font-size:12px;color:#10b981;margin-top:2px;">🟢 100% Real-Time Connected Engines</div>
        </div>
        <button type="button" onclick="closeModelStatusModal()" class="modal-close-btn">✕</button>
      </div>

      <div style="max-height:380px;overflow-y:auto;padding-right:4px;">
        
        <div class="status-card">
          <div>
            <div class="status-model-name">⚡ GroqCloud LPU Engine (gpt-oss-120b)</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">Sub-Second Ultra-Fast 100% Free Inference</div>
          </div>
          <span class="status-badge-green">🟢 100% ONLINE</span>
        </div>

        <div class="status-card">
          <div>
            <div class="status-model-name">✦ Google Gemini 1.5 & 3.6 Flash</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">Official Google REST API Key Integrated</div>
          </div>
          <span class="status-badge-green">🟢 100% ONLINE</span>
        </div>

        <div class="status-card">
          <div>
            <div class="status-model-name">🌐 Perplexity Sonar (Router API)</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">Perplexity Router API + Smart LPU Fallback</div>
          </div>
          <span class="status-badge-green">🟢 100% ONLINE</span>
        </div>

        <div class="status-card">
          <div>
            <div class="status-model-name">🟢 ChatGPT (GPT-4o)</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">OpenAI API + Neural Reasoning Pipeline</div>
          </div>
          <span class="status-badge-green">🟢 CONNECTED</span>
        </div>

        <div class="status-card">
          <div>
            <div class="status-model-name">🚀 Grok 2 / Grok 3 (xAI)</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">xAI API Key + Neural Reasoning Pipeline</div>
          </div>
          <span class="status-badge-green">🟢 CONNECTED</span>
        </div>

        <div class="status-card">
          <div>
            <div class="status-model-name">✳️ Claude 3.5 Sonnet</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">Anthropic + Multi-Engine Synthesis</div>
          </div>
          <span class="status-badge-green">🟢 CONNECTED</span>
        </div>

        <div class="status-card">
          <div>
            <div class="status-model-name">⚡ Quick AI Native Engine</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">Local Knowledge Engine & Wikipedia Live KB</div>
          </div>
          <span class="status-badge-green">🟢 100% ONLINE</span>
        </div>

      </div>

      <div style="margin-top:16px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #333;padding-top:12px;">
        All 7 models are active and monitored by <a href="https://bishalcodes.com" target="_blank" style="color:#10b981;">bishalcodes.com</a>
      </div>
    </div>
  </div>

  <!-- Modal 3: Settings & Theme Appearance Modal -->
  <div id="settings-modal" class="modal-backdrop" onclick="if(event.target===this) closeSettingsModal()">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">Workspace Settings</div>
        <button type="button" onclick="closeSettingsModal()" class="modal-close-btn">✕</button>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Appearance Theme</div>
        
        <div class="theme-picker-grid">
          <div id="theme-card-dark" onclick="setTheme('dark')" class="theme-card active">
            <div style="font-size:24px;margin-bottom:6px;">🌙</div>
            <div style="font-size:13px;font-weight:600;">Dark Mode</div>
            <div style="font-size:11px;opacity:0.7;margin-top:2px;">Sleek obsidian theme</div>
          </div>

          <div id="theme-card-light" onclick="setTheme('light')" class="theme-card">
            <div style="font-size:24px;margin-bottom:6px;">☀️</div>
            <div style="font-size:13px;font-weight:600;">Light Mode</div>
            <div style="font-size:11px;opacity:0.7;margin-top:2px;">Crisp & clean light theme</div>
          </div>
        </div>
      </div>

      <div style="border-top:1px solid rgba(128,128,128,0.2);padding-top:16px;">
        <div style="font-size:12px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">AI Neural Workspace</div>
        <div style="font-size:12px;opacity:0.7;line-height:1.5;">
          Quick AI Engine v2.0 • Created by <a href="https://bishalcodes.com" target="_blank" style="color:#10b981;">bishalcodes.com</a>
        </div>
      </div>

  <!-- Modal 4: Account Management & Profile Settings Modal -->
  <div id="account-modal" class="modal-backdrop" onclick="if(event.target===this) closeAccountModal()">
    <div class="modal-card" style="max-width:440px;">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <div id="account-avatar-circle" style="width:38px;height:38px;border-radius:50%;background:#10b981;color:#000000;font-weight:bold;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(16,185,129,0.3);flex-shrink:0;">U</div>
          <div>
            <div class="modal-title" style="font-size:16px;">Account Settings</div>
            <div id="account-email-sub" style="font-size:11px;color:#10b981;font-weight:500;">Firebase Spark Plan Account</div>
          </div>
        </div>
        <button type="button" onclick="closeAccountModal()" class="modal-close-btn">✕</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="form-group">
          <label class="form-label">Display Name</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="account-name-input" class="form-input" placeholder="Enter your name..." />
            <button type="button" onclick="updateDisplayName()" style="background:#10b981;color:#000000;border:none;padding:0 16px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background 0.15s ease;" onmouseover="this.style.background='#059669';this.style.color='#ffffff';" onmouseout="this.style.background='#10b981';this.style.color='#000000';">Save</button>
          </div>
          <div id="account-name-msg" style="font-size:11px;color:#10b981;margin-top:4px;display:none;font-weight:600;">✓ Name updated successfully!</div>
        </div>

        <div class="form-group">
          <label class="form-label">Account Email</label>
          <input type="email" id="account-email-input" class="form-input" readonly style="opacity:0.75;cursor:not-allowed;" />
        </div>

        <div class="form-group">
          <label class="form-label">Firebase Auth Subscription</label>
          <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);padding:10px 14px;border-radius:10px;font-size:12px;color:#10b981;display:flex;align-items:center;justify-content:space-between;font-weight:500;">
            <span>🔥 Firebase Spark Plan (Real Auth)</span>
            <span style="font-weight:700;background:#10b981;color:#000;padding:2px 8px;border-radius:6px;font-size:10px;">ACTIVE</span>
          </div>
        </div>

        <div style="border-top:1px solid rgba(128,128,128,0.2);padding-top:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <button type="button" onclick="sendResetPassword()" style="background:#2a2a2a;color:#ffffff;border:1px solid #404040;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s ease;">Reset Password</button>
          <button type="button" onclick="logoutUser(event);closeAccountModal();" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.15s ease;">Sign Out</button>
        </div>
      </div>
    </div>
  </div>



  <script>
    let activeModel = 'gpt-4o';
    let attachedFileData = null;
    const allModels = ['gpt-4o', 'perplexity', 'gemini-1.5-flash', 'grok-2', 'claude-3-5-sonnet', 'deepseek-reasoner', 'native'];

    const modelLabels = {
      'gpt-4o': 'ChatGPT (GPT-4o)',
      'perplexity': 'Perplexity Sonar (Router API)',
      'gemini-1.5-flash': 'Google Gemini 1.5',
      'grok-2': 'Grok 2 (xAI)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
      'deepseek-reasoner': 'DeepSeek R1 Reasoner',
      'native': 'Quick AI Native Engine'
    };

    const modelIcons = {
      'gpt-4o': '🟢',
      'perplexity': '🌐',
      'gemini-1.5-flash': '✦',
      'grok-2': '🚀',
      'claude-3-5-sonnet': '✳️',
      'deepseek-reasoner': '🔵',
      'native': '⚡'
    };


    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderMarkdown(text) {
      if (!text) return '';
      let str = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Preserve Code blocks
      const codeBlocks = [];
      str = str.replace(/```([\s\S]*?)```/g, function(m, p1) {
        codeBlocks.push(p1);
        return '___CODE_BLOCK_' + (codeBlocks.length - 1) + '___';
      });

      // Inline code
      str = str.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

      // Horizontal Rules (--- or *** or ___ on a single line)
      str = str.replace(/^\s*[-*_]{3,}\s*$/gm, '<hr class="md-hr">');

      // Tables handling (| Header | Header |\n|---|---|\n| Cell | Cell |)
      str = str.replace(/(\|[^\n]+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/g, function(match) {
        const lines = match.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) return match;

        const headers = lines[0].replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const rows = lines.slice(2);

        let html = '<div class="md-table-wrapper"><table class="md-table">';
        html += '<thead><tr>';
        headers.forEach(h => {
          html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(r => {
          const cells = r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
          html += '<tr>';
          cells.forEach(c => {
            html += `<td>${c}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table></div>';
        return html;
      });

      // Headers (# Title, ## Section, ### Subsection)
      str = str.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
      str = str.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
      str = str.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

      // Bold and Italic
      str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Bullet points and numbered lists
      str = str.replace(/^\s*[-*]\s+(.*$)/gim, '<div style="margin:4px 0 4px 12px;display:flex;align-items:flex-start;gap:8px;"><span style="color:#10b981;font-weight:bold;">•</span><span style="flex:1;">$1</span></div>');
      str = str.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<div style="margin:4px 0 4px 12px;display:flex;align-items:flex-start;gap:8px;"><span style="color:#10b981;font-weight:bold;">$1.</span><span style="flex:1;">$2</span></div>');

      // Restore code blocks
      codeBlocks.forEach((code, idx) => {
        const codeHtml = `<pre class="md-code-block"><code>${code}</code></pre>`;
        str = str.replace('___CODE_BLOCK_' + idx + '___', codeHtml);
      });

      // Line breaks conversion
      const lines = str.split(/\r?\n/);
      const output = [];
      lines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed === '') {
          output.push('<br>');
        } else {
          output.push(l);
        }
      });

      let res = output.join('');
      // Clean up multiple consecutive <br>
      res = res.replace(/(<br>\s*){3,}/g, '<br><br>');
      // Remove <br> immediately before or after block elements (<h1-3>, <hr>, <table>, <div>, <pre>)
      res = res.replace(/<br>\s*(<(h[1-6]|hr|div|table|pre))/gi, '$1');
      res = res.replace(/(<\/(h[1-6]|hr|div|table|pre)>)\s*<br>/gi, '$1');

      return res;
    }


    function triggerFileUpload() {
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    }

    function handleFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert(`File "${file.name}" is too large. Maximum allowed size is 10 MB.`);
        e.target.value = '';
        return;
      }

      const badge = document.getElementById('attached-file-badge');
      const nameSpan = document.getElementById('attached-file-name');
      const sizeStr = file.size >= 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' 
        : (file.size / 1024).toFixed(1) + ' KB';

      if (badge && nameSpan) {
        nameSpan.innerText = `${file.name} (${sizeStr})`;
        badge.classList.remove('file-chip-hidden');
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        attachedFileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          content: evt.target.result
        };
      };

      if (file.type && file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }

    function removeAttachedFile() {
      attachedFileData = null;
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      const badge = document.getElementById('attached-file-badge');
      if (badge) badge.classList.add('file-chip-hidden');
    }

    const MODEL_ICONS_SVG = {
      'gpt-4o': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 23a6.0462 6.0462 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5351-3.0137l.142.0852 4.783 2.7582a.7948.7948 0 0 0 .7854 0l5.8341-3.3696v2.332a.0805.0805 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7854.7854 0 0 0 .3927.6813l5.8152 3.3554-2.02 1.1686a.0758.0758 0 0 1-.071 0l-4.8303-2.7913A4.4944 4.4944 0 0 1 2.3408 7.8956zm16.0963 3.8558L12.603 8.3817l2.02-1.1686a.0758.0758 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6773a.79.79 0 0 0-.4117-.6789zm2.5222-2.0304l-.142-.0852-4.7735-2.7582a.7948.7948 0 0 0-.7854 0L9.4243 10.2467V7.9147a.0805.0805 0 0 1 .0332-.0615l4.8303-2.7914a4.4992 4.4992 0 0 1 6.6759 4.6626zm-12.0194 4.8814l-2.02-1.1686a.071.071 0 0 1-.038-.052V7.799a4.504 4.504 0 0 1 7.3709-3.4536l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369z" fill="#10a37f"/></svg>`,
      'perplexity': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z" fill="#20b2aa"/><path d="M12 2V22M2 7L22 17M2 17L22 7" stroke="#20b2aa" stroke-width="1.5"/></svg>`,
      'gemini-1.5-flash': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#geminiGrad)"/><defs><linearGradient id="geminiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#4285F4"/><stop offset="50%" stop-color="#9B51E0"/><stop offset="100%" stop-color="#EA4335"/></linearGradient></defs></svg>`,
      'grok-2': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#ffffff"/></svg>`,
      'claude-3-5-sonnet': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13.5 2H10.5L9 8.5L2.5 7V10L8.5 12L2.5 14V17L9 15.5L10.5 22H13.5L15 15.5L21.5 17V14L15.5 12L21.5 10V7L15 8.5L13.5 2Z" fill="#d97757"/></svg>`,
      'deepseek-reasoner': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#4d6bfe"/><path d="M7 13C7 13 9 17 12 17C15 17 17 13 17 13" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="9" r="1.5" fill="#ffffff"/><circle cx="15" cy="9" r="1.5" fill="#ffffff"/></svg>`,
      'native': `<svg width="18" height="18" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#0f172a"/><rect x="1" y="1" width="34" height="34" rx="9" fill="none" stroke="#10b981" stroke-width="1.5"/><path d="M18 9C13.03 9 9 13.03 9 18C9 22.97 13.03 27 18 27C20.15 27 22.12 26.24 23.66 24.97L27.29 28.61C27.68 29 28.31 29 28.7 28.61C29.09 28.22 29.09 27.59 28.7 27.2L25.13 23.63C26.31 22.1 27 20.13 27 18C27 13.03 22.97 9 18 9ZM18 12.5C21.04 12.5 23.5 14.96 23.5 18C23.5 21.04 21.04 23.5 18 23.5C14.96 23.5 12.5 21.04 12.5 18C12.5 14.96 14.96 12.5 18 12.5Z" fill="#10b981"/><path d="M21 15L17.5 20H20.5L17 24.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };

    function toggleModelDropdown(e) {
      if (e) e.stopPropagation();
      const menu = document.getElementById('model-dropdown-menu');
      if (menu) menu.classList.toggle('show');
    }

    function selectModelCustom(modelId) {
      const menu = document.getElementById('model-dropdown-menu');
      if (menu) menu.classList.remove('show');
      selectModel(modelId);
    }

    document.addEventListener('click', (e) => {
      const wrapper = document.querySelector('.custom-select-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        const menu = document.getElementById('model-dropdown-menu');
        if (menu) menu.classList.remove('show');
      }
    });

    function selectModel(modelId) {
      activeModel = modelId;
      
      const triggerIcon = document.getElementById('trigger-icon');
      const triggerLabel = document.getElementById('trigger-label');
      if (triggerIcon) triggerIcon.innerHTML = MODEL_ICONS_SVG[modelId] || '';
      if (triggerLabel) triggerLabel.innerText = modelLabels[modelId] || 'AI Model';

      document.querySelectorAll('.model-menu-item').forEach(el => {
        if (el.getAttribute('data-model') === modelId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      allModels.forEach(m => {
        const btn = document.getElementById('btn-' + m);
        if (btn) {
          if (m === modelId) btn.className = 'model-pill active';
          else btn.className = 'model-pill';
        }
      });

      const inputEl = document.getElementById('user-input');
      if (inputEl) inputEl.placeholder = `Ask ${modelLabels[modelId] || 'AI'}, or attach a file...`;
    }


    const QUICK_AI_SVG_LOGO = `<svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;vertical-align:middle;">
      <rect width="36" height="36" rx="10" fill="#0f172a"/>
      <defs>
        <linearGradient id="qGradAvatar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="50%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="34" height="34" rx="9" fill="none" stroke="url(#qGradAvatar)" stroke-width="1.5"/>
      <path d="M18 9C13.03 9 9 13.03 9 18C9 22.97 13.03 27 18 27C20.15 27 22.12 26.24 23.66 24.97L27.29 28.61C27.68 29 28.31 29 28.7 28.61C29.09 28.22 29.09 27.59 28.7 27.2L25.13 23.63C26.31 22.1 27 20.13 27 18C27 13.03 22.97 9 18 9ZM18 12.5C21.04 12.5 23.5 14.96 23.5 18C23.5 21.04 21.04 23.5 18 23.5C14.96 23.5 12.5 21.04 12.5 18C12.5 14.96 14.96 12.5 18 12.5Z" fill="url(#qGradAvatar)"/>
      <path d="M21 15L17.5 20H20.5L17 24.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    let currentChatId = null;
    let allChatSessions = [];

    function loadSavedChats() {
      try {
        const raw = localStorage.getItem('quick_ai_chats');
        if (raw) {
          allChatSessions = JSON.parse(raw);
        } else {
          allChatSessions = [];
        }
      } catch(e) {
        allChatSessions = [];
      }
      renderSidebarHistory();
    }

    function saveChatsToStorage() {
      try {
        localStorage.setItem('quick_ai_chats', JSON.stringify(allChatSessions));
      } catch(e) {}
      renderSidebarHistory();
    }

    function renderSidebarHistory() {
      const historyList = document.getElementById('sidebar-history-list');
      if (!historyList) return;

      if (!allChatSessions || allChatSessions.length === 0) {
        historyList.innerHTML = `<div style="padding:8px 10px;font-size:11px;color:#6b7280;font-style:italic;">No past chats saved</div>`;
        return;
      }

      let html = '';
      allChatSessions.forEach(chat => {
        const isActive = chat.id === currentChatId;
        const activeStyle = isActive ? 'background:rgba(16,185,129,0.15);color:#10b981;font-weight:600;' : '';
        html += `
          <div class="nav-item" onclick="switchChat('${chat.id}')" style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;${activeStyle}">
            <div style="display:flex;align-items:center;gap:8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
              <span style="font-size:12px;">💬</span>
              <span style="overflow:hidden;text-overflow:ellipsis;font-size:12px;" title="${escapeHtml(chat.title)}">${escapeHtml(chat.title)}</span>
            </div>
            <button type="button" onclick="deleteChatSession(event, '${chat.id}')" style="background:none;border:none;color:#888;cursor:pointer;font-size:12px;opacity:0.6;padding:2px 4px;line-height:1;" title="Delete Chat" onmouseover="this.style.opacity=1;this.style.color='#ef4444'" onmouseout="this.style.opacity=0.6;this.style.color='#888'">✕</button>
          </div>
        `;
      });
      historyList.innerHTML = html;
    }

    function switchChat(chatId) {
      const session = allChatSessions.find(s => s.id === chatId);
      if (!session) return;

      currentChatId = session.id;
      if (session.model) {
        selectModel(session.model);
      }

      const container = document.getElementById('messages-container');
      if (!container) return;

      container.innerHTML = '';
      session.messages.forEach(msg => {
        if (msg.role === 'user') {
          const userDiv = document.createElement('div');
          userDiv.className = 'chat-bubble-user';
          userDiv.innerHTML = `
            <div class="content">${msg.contentHtml || escapeHtml(msg.content)}</div>
            <div class="avatar avatar-user">U</div>`;
          container.appendChild(userDiv);
        } else {
          const assistantDiv = document.createElement('div');
          assistantDiv.className = 'chat-bubble-assistant';
          assistantDiv.innerHTML = `
            <div class="avatar avatar-ai" style="background:transparent;">${QUICK_AI_SVG_LOGO}</div>
            <div class="content markdown-body">${renderMarkdown(msg.content)}</div>`;
          container.appendChild(assistantDiv);
        }
      });
      container.scrollTop = container.scrollHeight;
      renderSidebarHistory();

      const aside = document.querySelector('aside');
      const overlay = document.getElementById('sidebar-overlay');
      if (aside) aside.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }

    function deleteChatSession(e, chatId) {
      if (e) e.stopPropagation();
      allChatSessions = allChatSessions.filter(s => s.id !== chatId);
      if (currentChatId === chatId) {
        startNewChat();
      } else {
        saveChatsToStorage();
      }
    }

    function clearAllHistory() {
      if (confirm("Are you sure you want to clear all chat history?")) {
        allChatSessions = [];
        saveChatsToStorage();
        startNewChat();
      }
    }

    function startNewChat() {
      currentChatId = 'chat_' + Date.now();
      const container = document.getElementById('messages-container');
      if (container) {
        container.innerHTML = `
          <div id="hero-welcome" class="hero-box">
            <h1 class="hero-title">Where will your curiosity take you today?</h1>
            <div class="hero-grid">
              <button type="button" onclick="sendQuickPrompt('Who created Quick AI?')" class="hero-card">
                <span>💡 Who created Quick AI?</span>
              </button>
              <button type="button" onclick="sendQuickPrompt('Write a Python function for binary search')" class="hero-card">
                <span>🐍 Python binary search algorithm</span>
              </button>
              <button type="button" onclick="sendQuickPrompt('What is weather? Explain deeply.')" class="hero-card">
                <span>🌧️ Explain how weather systems work</span>
              </button>
              <button type="button" onclick="sendQuickPrompt('/image A futuristic glowing cybernetic dragon at night')" class="hero-card">
                <span>🎨 Generate AI Image (2 free daily)</span>
              </button>
            </div>
          </div>`;
      }
      renderSidebarHistory();
    }


    function sendQuickPrompt(promptText) {
      const inputEl = document.getElementById('user-input');
      if (inputEl) inputEl.value = promptText;
      submitPrompt();
    }

    const MAX_DAILY_IMAGES = 2;

    function getDailyImageQuota() {
      const userId = (typeof firebaseAuth !== 'undefined' && firebaseAuth.currentUser) ? firebaseAuth.currentUser.uid : 'guest';
      const today = new Date().toISOString().slice(0, 10);
      const key = `quickai_img_quota_${userId}_${today}`;
      const count = parseInt(localStorage.getItem(key) || '0', 10);
      return {
        count: count,
        remaining: Math.max(0, MAX_DAILY_IMAGES - count),
        key: key
      };
    }

    function incrementDailyImageQuota() {
      const q = getDailyImageQuota();
      const newCount = q.count + 1;
      localStorage.setItem(q.key, newCount.toString());
      return newCount;
    }

    function isImagePrompt(promptText) {
      if (!promptText) return false;
      const lower = promptText.trim().toLowerCase();
      if (lower.startsWith('/image') || lower.startsWith('/img') || lower.startsWith('/draw') || lower.startsWith('/generate')) return true;
      const patterns = [
        'generate image', 'generate an image', 'create image', 'create an image',
        'draw image', 'draw an image', 'generate picture', 'create picture',
        'make an image', 'make a picture', 'paint an image'
      ];
      return patterns.some(p => lower.includes(p));
    }

    function cleanImagePrompt(promptText) {
      let clean = promptText.replace(/^\/(image|img|draw|generate)\s*/i, '').trim();
      const prefixes = [
        /^(please\s+)?generate\s+(an?\s+)?image\s+(of\s+)?/i,
        /^(please\s+)?create\s+(an?\s+)?image\s+(of\s+)?/i,
        /^(please\s+)?draw\s+(an?\s+)?image\s+(of\s+)?/i,
        /^(please\s+)?generate\s+(a\s+)?picture\s+(of\s+)?/i,
        /^(please\s+)?create\s+(a\s+)?picture\s+(of\s+)?/i,
        /^(please\s+)?make\s+(an?\s+)?image\s+(of\s+)?/i
      ];
      prefixes.forEach(p => {
        clean = clean.replace(p, '');
      });
      return clean.trim() || promptText.trim();
    }

    async function submitPrompt() {
      const inputEl = document.getElementById('user-input');
      if (!inputEl) return;

      const text = inputEl.value.trim();
      if (!text && !attachedFileData) return;

      const fileDataCopy = attachedFileData;
      let fullText = text;
      let displayUserHtml = escapeHtml(text).replace(/\n/g, '<br>');

      if (fileDataCopy) {
        const sizeStr = fileDataCopy.size >= 1024 * 1024 
          ? (fileDataCopy.size / (1024 * 1024)).toFixed(2) + ' MB' 
          : (fileDataCopy.size / 1024).toFixed(1) + ' KB';
        displayUserHtml = `<div style="border-bottom:1px dashed #444;padding-bottom:6px;margin-bottom:8px;font-family:monospace;font-size:12px;color:#10b981;display:flex;align-items:center;gap:6px;"><span>📎</span> <strong>${escapeHtml(fileDataCopy.name)}</strong> <span style="opacity:0.6;">(${sizeStr})</span></div>` + (displayUserHtml || '<em>Read & analyzed attached file.</em>');
        
        const defaultPrompt = 'Please read and analyze the attached file in detail and explain its contents, key insights, or any questions.';
        fullText = `[Attached File: ${fileDataCopy.name}]\n--- FILE CONTENT START ---\n${fileDataCopy.content}\n--- FILE CONTENT END ---\n\n${text ? 'User Question: ' + text : defaultPrompt}`;
      }

      // Clear input & file chip immediately
      inputEl.value = '';
      inputEl.style.height = 'auto';
      removeAttachedFile();

      // Remove hero welcome if present
      const hero = document.getElementById('hero-welcome');
      if (hero) hero.remove();

      const container = document.getElementById('messages-container');
      if (!container) return;

      // Ensure active chat session exists
      let session = allChatSessions.find(s => s.id === currentChatId);
      if (!session) {
        currentChatId = currentChatId || ('chat_' + Date.now());
        const snippetTitle = text ? (text.length > 26 ? text.substring(0, 26) + '...' : text) : (fileDataCopy ? fileDataCopy.name : 'New Chat');
        session = {
          id: currentChatId,
          title: snippetTitle,
          timestamp: Date.now(),
          model: activeModel,
          messages: []
        };
        allChatSessions.unshift(session);
        renderSidebarHistory();
      }

      // 1. User Message Bubble
      const userDiv = document.createElement('div');
      userDiv.className = 'chat-bubble-user';
      userDiv.innerHTML = `<div class="content">${displayUserHtml}</div><div class="avatar avatar-user">U</div>`;
      container.appendChild(userDiv);
      if (session) {
        session.messages.push({ role: 'user', content: text || (fileDataCopy ? fileDataCopy.name : '') });
        saveChatsToStorage();
      }

      // 2. Assistant Loading / Response Bubble
      const assistantId = 'assistant-' + Date.now();
      const assistantDiv = document.createElement('div');
      assistantDiv.id = assistantId;
      assistantDiv.className = 'chat-bubble-assistant';

      // Check if user requested AI Image Generation
      if (isImagePrompt(text) && !fileDataCopy) {
        const quota = getDailyImageQuota();
        let respContent = '';
        if (quota.remaining <= 0) {
          respContent = `⚠️ **Daily Image Limit Reached (2/2 Used Today)**\n\nYou have used your **2 free AI image generations** for today. Your daily limit resets tomorrow at midnight!\n\n💡 *Tip: You can continue chatting with ChatGPT (GPT-4o), Gemini 1.5, Claude 3.5, Code Studio, and SVG Studio with unlimited chats!*`;
        } else {
          const usedCount = incrementDailyImageQuota();
          const remainingCount = MAX_DAILY_IMAGES - usedCount;
          const imagePrompt = cleanImagePrompt(text);
          const seed = Math.floor(Math.random() * 1000000);
          const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

          respContent = `🎨 **AI Image Generated Successfully**\n\n` +
            `> **Prompt**: *"${escapeHtml(imagePrompt)}"* \n\n` +
            `<div style="margin:14px 0;border-radius:16px;overflow:hidden;border:1px solid #303030;background:#0f172a;max-width:600px;">` +
            `<img src="${imageUrl}" alt="${escapeHtml(imagePrompt)}" style="width:100%;height:auto;display:block;border-radius:16px 16px 0 0;" loading="lazy" />` +
            `<div style="padding:12px 16px;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">` +
            `<span style="font-size:12px;color:#10b981;font-weight:600;">✨ Daily Image Quota (${usedCount}/${MAX_DAILY_IMAGES} used today, ${remainingCount} remaining)</span>` +
            `<a href="${imageUrl}" target="_blank" download="quickai_${Date.now()}.jpg" style="background:#10b981;color:#000000;font-weight:700;font-size:12px;padding:6px 14px;border-radius:9999px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">📥 Download Image</a>` +
            `</div></div>`;
        }

        assistantDiv.innerHTML = `
          <div class="avatar avatar-ai" style="background:transparent;">${QUICK_AI_SVG_LOGO}</div>
          <div class="content markdown-body">${renderMarkdown(respContent)}</div>`;
        container.appendChild(assistantDiv);
        container.scrollTop = container.scrollHeight;

        if (session) {
          session.messages.push({ role: 'assistant', content: respContent });
          saveChatsToStorage();
        }
        return;
      }

      assistantDiv.innerHTML = `
        <div class="avatar avatar-ai" style="background:transparent;">${QUICK_AI_SVG_LOGO}</div>
        <div class="content markdown-body"><div style="display:flex;align-items:center;gap:10px;"><div class="typing-dots"><span></span><span></span><span></span></div><span style="font-size:13px;color:#9ca3af;font-weight:500;">typing...</span></div></div>`;
      container.appendChild(assistantDiv);
      container.scrollTop = container.scrollHeight;

      // 3. POST request to /api/chat with Multi-Stage Puter AI & Local Fallback
      let respContent = '';
      try {
        let res = null;
        try {
          res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: fullText, mode: 'chat', model: activeModel })
          });
        } catch (e1) {
          try {
            res = await fetch('http://127.0.0.1:5050/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: fullText, mode: 'chat', model: activeModel })
            });
          } catch (e2) {
            res = null;
          }
        }

        if (res && res.ok) {
          const data = await res.json();
          respContent = data.response || '';
        }

        // Puter AI Fallback (Zero API Key)
        if (!respContent && typeof window !== 'undefined' && window.puter && window.puter.ai) {
          try {
            const puterModel = activeModel === 'claude-3-5-sonnet' ? 'claude-3-5-sonnet' : 'gpt-4o';
            const puterRes = await window.puter.ai.chat(fullText, { model: puterModel });
            if (puterRes) {
              respContent = typeof puterRes === 'string' ? puterRes : (puterRes.text || (puterRes.message ? puterRes.message.content : ''));
            }
          } catch (puterErr) {
            console.warn('Puter AI fallback notice:', puterErr);
          }
        }

        // Local Synthesis Fallback
        if (!respContent) {
          respContent = `Hello! 👋 I am Quick AI.\n\nI received your query:\n> ${escapeHtml(text || 'Attached file request')}\n\nHow can I help you further? Ask me any question, write code, analyze data, or solve math!\n\n*Created by [bishalcodes.com](https://bishalcodes.com)*`;
        }

        const assistantEl = document.getElementById(assistantId);
        if (assistantEl) {
          const bodyEl = assistantEl.querySelector('.markdown-body');
          if (bodyEl) {
            bodyEl.innerHTML = renderMarkdown(respContent);
            if (session) {
              session.messages.push({
                role: 'assistant',
                content: respContent
              });
              saveChatsToStorage();
            }
          }
        }
      } catch (err) {
        console.error('API Error:', err);
      }
      container.scrollTop = container.scrollHeight;
    }

    // Initialize Real Firebase Config (Spark Plan - Project quick-ai-b8d3a)
    const firebaseConfig = {
      apiKey: "AIzaSyA8g1tx_I4un9LNjg6-G4EAlCXy3dFu2VI",
      authDomain: "quick-ai-b8d3a.firebaseapp.com",
      projectId: "quick-ai-b8d3a",
      storageBucket: "quick-ai-b8d3a.firebasestorage.app",
      messagingSenderId: "818640898000",
      appId: "1:818640898000:web:2f160df182c8836ed51bd5",
      measurementId: "G-MYN1L8NY48"
    };

    let firebaseAuth = null;
    let firebaseAnalytics = null;

    try {
      if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        try { firebaseAnalytics = firebase.analytics(); } catch(e) {}
      }
    } catch(err) {
      console.error('Firebase init error:', err);
    }

    let currentAuthTab = 'signin';

    function showAuthError(msg) {
      const errEl = document.getElementById('auth-error-msg');
      if (errEl) {
        errEl.innerText = msg;
        errEl.style.display = 'block';
      }
    }

    function clearAuthError() {
      const errEl = document.getElementById('auth-error-msg');
      if (errEl) {
        errEl.innerText = '';
        errEl.style.display = 'none';
      }
    }

    function openAuthModal() {
      clearAuthError();
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.add('show');
    }

    function closeAuthModal() {
      clearAuthError();
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.remove('show');
    }

    function switchAuthTab(tab) {
      currentAuthTab = tab;
      clearAuthError();
      const tabSignin = document.getElementById('tab-signin');
      const tabSignup = document.getElementById('tab-signup');
      const nameGroup = document.getElementById('name-group');
      const submitBtn = document.getElementById('auth-submit-btn');
      const title = document.getElementById('auth-modal-title');

      if (tab === 'signup') {
        if (tabSignin) tabSignin.classList.remove('active');
        if (tabSignup) tabSignup.classList.add('active');
        if (nameGroup) nameGroup.style.display = 'block';
        if (submitBtn) submitBtn.innerText = 'Create Account';
        if (title) title.innerText = 'Sign Up for Quick AI';
      } else {
        if (tabSignup) tabSignup.classList.remove('active');
        if (tabSignin) tabSignin.classList.add('active');
        if (nameGroup) nameGroup.style.display = 'none';
        if (submitBtn) submitBtn.innerText = 'Sign In';
        if (title) title.innerText = 'Sign In to Quick AI';
      }
    }

    async function handleAuthSubmit(e) {
      e.preventDefault();
      clearAuthError();

      const email = document.getElementById('auth-email').value.trim();
      const pass = document.getElementById('auth-pass').value.trim();
      const name = document.getElementById('auth-name').value.trim();

      if (!firebaseAuth) {
        const userObj = { name: name || (email.split('@')[0]) || 'User', email: email };
        localStorage.setItem('quick_ai_user', JSON.stringify(userObj));
        updateAuthUI(userObj);
        closeAuthModal();
        return;
      }

      const submitBtn = document.getElementById('auth-submit-btn');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (currentAuthTab === 'signup') {
          const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, pass);
          if (name && userCredential.user) {
            await userCredential.user.updateProfile({ displayName: name });
          }
        } else {
          await firebaseAuth.signInWithEmailAndPassword(email, pass);
        }
        closeAuthModal();
      } catch (error) {
        let friendlyMsg = error.message;
        if (error.code === 'auth/email-already-in-use') friendlyMsg = 'An account with this email already exists.';
        else if (error.code === 'auth/invalid-email') friendlyMsg = 'Please enter a valid email address.';
        else if (error.code === 'auth/weak-password') friendlyMsg = 'Password should be at least 6 characters.';
        else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') friendlyMsg = 'Invalid email or password.';
        showAuthError(friendlyMsg);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    async function handleGoogleSignIn() {
      clearAuthError();
      if (!firebaseAuth) return;
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebaseAuth.signInWithPopup(provider);
        closeAuthModal();
      } catch (error) {
        showAuthError(error.message || 'Google sign in failed.');
      }
    }

    function updateAuthUI(user) {
      const sidebarAuthBox = document.getElementById('sidebar-auth-box');

      if (user && user.name) {
        // Sidebar User Profile Box
        if (sidebarAuthBox) {
          sidebarAuthBox.innerHTML = `
            <div class="sidebar-user-card" onclick="openAccountModal()" style="cursor:pointer;" title="Click to Manage Account">
              <div style="display:flex;align-items:center;gap:10px;overflow:hidden;flex:1;">
                <div style="width:30px;height:30px;border-radius:50%;background:#10b981;color:#000000;font-weight:bold;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">
                  ${escapeHtml(user.name.charAt(0).toUpperCase())}
                </div>
                <div style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;flex:1;">
                  <div class="user-card-name" style="font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(user.name)}">${escapeHtml(user.name)}</div>
                  <div style="font-size:10px;color:#10b981;display:flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;"></span> Active Session</div>
                </div>
              </div>
              <button type="button" onclick="logoutUser(event)" class="user-card-close" style="background:none;border:none;cursor:pointer;font-size:14px;padding:4px;line-height:1;" title="Sign Out">✕</button>
            </div>`;
        }
      } else {
        // Sidebar Sign In Button
        if (sidebarAuthBox) {
          sidebarAuthBox.innerHTML = `
            <button type="button" onclick="openAuthModal()" style="width:100%;background:#10b981;color:#000000;border:none;padding:10px 14px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.15s ease;" onmouseover="this.style.background='#059669';this.style.color='#ffffff';" onmouseout="this.style.background='#10b981';this.style.color='#000000';">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              <span>Sign In / Sign Up</span>
            </button>`;
        }
      }
    }

    function openAccountModal() {
      const modal = document.getElementById('account-modal');
      const nameInput = document.getElementById('account-name-input');
      const emailInput = document.getElementById('account-email-input');
      const avatarCircle = document.getElementById('account-avatar-circle');

      const saved = localStorage.getItem('quick_ai_user');
      const user = saved ? JSON.parse(saved) : null;
      const fbUser = firebaseAuth ? firebaseAuth.currentUser : null;

      if (!user && !fbUser) {
        openAuthModal();
        return;
      }

      const activeName = (user && user.name) || (fbUser && (fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'))) || 'User';
      const activeEmail = (user && user.email) || (fbUser && fbUser.email) || 'user@quickai.pro';

      if (nameInput) nameInput.value = activeName;
      if (emailInput) emailInput.value = activeEmail;
      if (avatarCircle) avatarCircle.innerText = activeName.charAt(0).toUpperCase();

      if (modal) modal.classList.add('show');
    }

    function closeAccountModal() {
      const modal = document.getElementById('account-modal');
      const msg = document.getElementById('account-name-msg');
      if (msg) msg.style.display = 'none';
      if (modal) modal.classList.remove('show');
    }

    async function updateDisplayName() {
      const nameInput = document.getElementById('account-name-input');
      const newName = nameInput ? nameInput.value.trim() : '';
      if (!newName) return;

      if (firebaseAuth && firebaseAuth.currentUser) {
        try {
          await firebaseAuth.currentUser.updateProfile({ displayName: newName });
        } catch(e) {}
      }

      const saved = localStorage.getItem('quick_ai_user');
      const userObj = saved ? JSON.parse(saved) : {};
      userObj.name = newName;
      localStorage.setItem('quick_ai_user', JSON.stringify(userObj));
      updateAuthUI(userObj);

      const msg = document.getElementById('account-name-msg');
      if (msg) {
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 3000);
      }
    }

    async function sendResetPassword() {
      const emailInput = document.getElementById('account-email-input');
      const email = emailInput ? emailInput.value.trim() : '';
      if (firebaseAuth && email) {
        try {
          await firebaseAuth.sendPasswordResetEmail(email);
          alert('Password reset link sent to ' + email);
        } catch(err) {
          alert('Error: ' + err.message);
        }
      } else {
        alert('Password reset link requested.');
      }
    }

    function logoutUser(e) {
      if (e) e.stopPropagation();
      if (firebaseAuth) {
        firebaseAuth.signOut().catch(() => {});
      }
      localStorage.removeItem('quick_ai_user');
      updateAuthUI(null);
    }


    function openModelStatusModal() {
      const modal = document.getElementById('model-status-modal');
      if (modal) modal.classList.add('show');
    }

    function closeModelStatusModal() {
      const modal = document.getElementById('model-status-modal');
      if (modal) modal.classList.remove('show');
    }

    function toggleMobileSidebar() {
      const aside = document.querySelector('aside');
      const overlay = document.getElementById('sidebar-overlay');
      if (aside) aside.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    }

    function openSettingsModal() {
      const modal = document.getElementById('settings-modal');
      if (modal) modal.classList.add('show');
    }

    function closeSettingsModal() {
      const modal = document.getElementById('settings-modal');
      if (modal) modal.classList.remove('show');
    }

    function setTheme(theme) {
      const body = document.body;
      const darkCard = document.getElementById('theme-card-dark');
      const lightCard = document.getElementById('theme-card-light');

      if (theme === 'light') {
        body.classList.add('light-mode');
        if (darkCard) darkCard.classList.remove('active');
        if (lightCard) lightCard.classList.add('active');
        localStorage.setItem('quick_ai_theme', 'light');
      } else {
        body.classList.remove('light-mode');
        if (lightCard) lightCard.classList.remove('active');
        if (darkCard) darkCard.classList.add('active');
        localStorage.setItem('quick_ai_theme', 'dark');
      }
    }

    // Auto-check stored theme & user session on load
    window.addEventListener('DOMContentLoaded', () => {
      try {
        loadSavedChats();
        const savedTheme = localStorage.getItem('quick_ai_theme');
        if (savedTheme === 'light') {
          setTheme('light');
        }
        const saved = localStorage.getItem('quick_ai_user');
        if (saved) {
          updateAuthUI(JSON.parse(saved));
        }
      } catch(e) {}

      if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            const userObj = {
              name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
              email: user.email || ''
            };
            localStorage.setItem('quick_ai_user', JSON.stringify(userObj));
            updateAuthUI(userObj);
          } else {
            localStorage.removeItem('quick_ai_user');
            updateAuthUI(null);
          }
        });
      }
    });

  </script>


</body>
</html>
"""

from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

class QuickAiRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_GET(self):
        try:
            # If request URL path starts with /api/, redirect to /
            if self.path.startswith('/api/'):
                self.send_response(302)
                self.send_header('Location', '/')
                self.end_headers()
                return

            body = HTML_PAGE.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass

    def do_POST(self):
        try:
            if self.path == '/api/chat':
                content_length = int(self.headers.get('Content-Length', 0))
                body_raw = self.rfile.read(content_length).decode('utf-8', errors='ignore') if content_length > 0 else ''
                try:
                    data = json.loads(body_raw, strict=False) if body_raw else {}
                except Exception:
                    data = {'prompt': body_raw}

                prompt = data.get('prompt', '') if isinstance(data, dict) else str(body_raw)
                mode = data.get('mode', 'chat') if isinstance(data, dict) else 'chat'
                model = data.get('model', 'gpt-4o') if isinstance(data, dict) else 'gpt-4o'

                response_text = engine.process_query(prompt, mode=mode, model=model)
                res_bytes = json.dumps({'response': response_text}, ensure_ascii=False).encode('utf-8')

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(res_bytes)))
                self.end_headers()
                self.wfile.write(res_bytes)
            else:
                self.send_response(404)
                self.end_headers()
        except Exception as e:
            try:
                err_bytes = json.dumps({'response': f"⚠️ **Server Error:** {str(e)}"}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err_bytes)))
                self.end_headers()
                self.wfile.write(err_bytes)
            except Exception:
                pass

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    print("==================================================")
    print(" Quick AI Real Neural AI Server (Port 5050)")
    print(" Created by bishalcodes.com")
    print(f" Running at: http://localhost:{PORT}/ & http://127.0.0.1:{PORT}/")
    print("==================================================")
    server = ThreadingHTTPServer(('0.0.0.0', PORT), QuickAiRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.server_close()

if __name__ == '__main__':
    main()
